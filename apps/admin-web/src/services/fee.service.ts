import { BaseService } from './base.service';
import type { Fee } from '../types';
import { INITIAL_FEES } from '../data';
import { generateId, generateReceiptNo } from '../utils';

class FeeService extends BaseService<Fee> {
  constructor() {
    super('fees', INITIAL_FEES as Fee[]);
  }

  async getByStudent(studentId: string) {
    const all = this.getAllFromStorage().filter(f => !f.isDeleted);
    return { success: true, data: all.filter(f => f.studentId === studentId) };
  }

  async getByStatus(status: string) {
    const all = this.getAllFromStorage().filter(f => !f.isDeleted);
    return { success: true, data: all.filter(f => f.status === status) };
  }

  async getOverdue() {
    const all = this.getAllFromStorage().filter(f => !f.isDeleted);
    const today = new Date().toISOString().split('T')[0];
    return { success: true, data: all.filter(f => f.dueDate < today && (f.status === 'Pending' || f.status === 'Partial')) };
  }

  async createFee(data: {
    studentId: string; studentName: string;
    feeType: Fee['feeType']; amount: number;
    dueDate: string; allocationId?: string;
    period?: string; remarks?: string;
  }) {
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(data.studentId);
    if (!stuRes.success || !stuRes.data || stuRes.data.isDeleted) {
      return { success: false, error: 'Student not found' };
    }

    // Business rule: one active fee per billing period
    if (data.period) {
      const existing = this.getAllFromStorage().filter(f => !f.isDeleted);
      const dup = existing.find(
        f => f.studentId === data.studentId && f.period === data.period && f.feeType === data.feeType && f.status !== 'Refund'
      );
      if (dup) {
        return { success: false, error: `A ${data.feeType} fee already exists for ${data.studentName} in period ${data.period}` };
      }
    }

    const now = new Date().toISOString();
    const newFee: Fee = {
      id: generateId(),
      studentId: data.studentId,
      studentName: data.studentName,
      feeType: data.feeType,
      amount: data.amount,
      paidAmount: 0,
      balance: data.amount,
      dueDate: data.dueDate,
      status: 'Pending',
      allocationId: data.allocationId,
      period: data.period,
      remarks: data.remarks,
      createdAt: now,
      updatedAt: now,
    };

    const all = this.getAllFromStorage();
    all.push(newFee);
    this.saveToStorage(all);

    const { feeEventService } = await import('./fee-event.service');
    await feeEventService.log(newFee.id, 'Created', undefined, undefined, 'Pending', data.amount);

    return { success: true, data: newFee };
  }

  async updateFee(id: string, data: Partial<Omit<Fee, 'id' | 'isDeleted'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) return { success: false, error: 'Fee not found' };

    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { feeEventService } = await import('./fee-event.service');
    await feeEventService.log(id, 'Updated', undefined, undefined, undefined, undefined, 'Fee details updated');

    return { success: true, data: all[idx] };
  }

  async recordPayment(id: string, data: {
    paidAmount: number;
    paymentMethod?: Fee['paymentMethod'];
    transactionId?: string;
    paidDate?: string;
  }) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) return { success: false, error: 'Fee not found' };

    const fee = all[idx];
    if (fee.isDeleted) return { success: false, error: 'Fee record is deleted' };

    const currentPaid = fee.paidAmount || 0;
    const totalPaid = currentPaid + data.paidAmount;

    // Business rule: prevent overpayment
    if (totalPaid > fee.amount) {
      return { success: false, error: `Overpayment detected. Total paid (${totalPaid}) exceeds fee amount (${fee.amount}). Remaining: ${fee.amount - currentPaid}` };
    }

    const oldStatus = fee.status;
    const newBalance = fee.amount - totalPaid;
    let newStatus: Fee['status'];

    // Business rule: full payment → Paid, partial → Partial
    if (totalPaid >= fee.amount) {
      newStatus = 'Paid';
    } else if (totalPaid > 0) {
      newStatus = 'Partial';
    } else {
      newStatus = 'Pending';
    }

    all[idx] = {
      ...fee,
      paidAmount: totalPaid,
      balance: newBalance,
      status: newStatus,
      paidDate: data.paidDate || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod || fee.paymentMethod,
      transactionId: data.transactionId || fee.transactionId,
      receiptNo: generateReceiptNo(),
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { feeEventService } = await import('./fee-event.service');
    await feeEventService.log(
      id, 'PaymentReceived', undefined, oldStatus, newStatus,
      data.paidAmount,
      `Payment of ₹${data.paidAmount} received. Total paid: ₹${totalPaid}`,
    );

    // Notify student with receipt info
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(fee.studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({
        userId: stuRes.data.userId,
        title: 'Payment Received',
        message: `Payment of ₹${data.paidAmount} received for ${fee.feeType}. Receipt No: ${all[idx].receiptNo}. Balance: ₹${newBalance}.`,
        type: 'Fee Due',
        read: false,
        date: new Date().toISOString().split('T')[0],
      });
    }

    return { success: true, data: all[idx] };
  }

  async checkOverdueStatus() {
    const all = this.getAllFromStorage();
    const today = new Date().toISOString().split('T')[0];
    let changed = 0;
    for (let idx = 0; idx < all.length; idx++) {
      const fee = all[idx];
      if (!fee.isDeleted && (fee.status === 'Pending' || fee.status === 'Partial') && fee.dueDate < today) {
        const oldStatus = fee.status;
        all[idx] = { ...fee, status: 'Overdue', updatedAt: new Date().toISOString() };
        this.saveToStorage(all);
        const { feeEventService } = await import('./fee-event.service');
        feeEventService.log(fee.id, 'StatusChanged', undefined, oldStatus, 'Overdue', undefined, 'Auto-marked as overdue');
        changed++;
        // Notify student
        const { studentService } = await import('./student.service');
        const stuRes = await studentService.getById(fee.studentId);
        if (stuRes.success && stuRes.data?.userId) {
          const { notificationService } = await import('./notification.service');
          await notificationService.add({ userId: stuRes.data.userId, title: 'Fee Overdue', message: `Your ${fee.feeType} of ₹${fee.amount} is overdue. Due date was ${fee.dueDate}.`, type: 'Fee Due', read: false, date: new Date().toISOString().split('T')[0] });
        }
      }
    }
    return { success: true, data: { changed } };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) return { success: false, error: 'Fee not found' };

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return { success: true, data: all[idx] };
  }

  async restore(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) return { success: false, error: 'Fee not found' };

    all[idx] = { ...all[idx], isDeleted: false, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return { success: true, data: all[idx] };
  }

  async getHistory(feeId: string) {
    const { feeEventService } = await import('./fee-event.service');
    return feeEventService.getByFee(feeId);
  }
}

export const feeService = new FeeService();
