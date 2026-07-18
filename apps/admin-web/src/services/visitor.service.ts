import { BaseService } from './base.service';
import type { Visitor } from '../types';
import { INITIAL_VISITORS } from '../data';
import { generateId } from '../utils';

class VisitorService extends BaseService<Visitor> {
  constructor() {
    super('visitors', INITIAL_VISITORS as Visitor[]);
  }

  async getByStudent(studentId: string) {
    const all = this.getAllFromStorage().filter(v => !v.isDeleted);
    return { success: true, data: all.filter(v => v.studentId === studentId) };
  }

  async getByStatus(status: string) {
    const all = this.getAllFromStorage().filter(v => !v.isDeleted);
    return { success: true, data: all.filter(v => v.status === status) };
  }

  async getPending() {
    return this.getByStatus('Pending');
  }

  async getActive() {
    const all = this.getAllFromStorage().filter(v => !v.isDeleted);
    return { success: true, data: all.filter(v => v.status === 'Approved' || v.status === 'Checked In') };
  }

  async registerVisitor(data: {
    visitorName: string; phone: string;
    idProofType?: string; idProofNo?: string;
    studentId: string; studentName: string;
    relation: string; date: string;
    checkInTime?: string; purpose?: string;
    remarks?: string;
  }) {
    // Business rule: student must exist
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(data.studentId);
    if (!stuRes.success || !stuRes.data || stuRes.data.isDeleted) {
      return { success: false, error: 'Student not found' };
    }

    const now = new Date().toISOString();
    const newVisitor: Visitor = {
      id: generateId(),
      visitorName: data.visitorName,
      phone: data.phone,
      idProofType: data.idProofType,
      idProofNo: data.idProofNo,
      studentId: data.studentId,
      studentName: data.studentName,
      relation: data.relation,
      date: data.date,
      checkInTime: data.checkInTime,
      purpose: data.purpose,
      status: 'Pending',
      remarks: data.remarks,
      createdAt: now,
      updatedAt: now,
    };

    const all = this.getAllFromStorage();
    all.push(newVisitor);
    this.saveToStorage(all);

    const { visitorEventService } = await import('./visitor-event.service');
    await visitorEventService.log(newVisitor.id, 'Registered', undefined, undefined, 'Pending', `Visitor ${data.visitorName} registered`);

    return { success: true, data: newVisitor };
  }

  async approveVisitor(id: string, approvedBy: string, remarks?: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return { success: false, error: 'Visitor not found' };

    if (all[idx].status !== 'Pending') {
      return { success: false, error: `Cannot approve a ${all[idx].status} visitor` };
    }

    const oldStatus = all[idx].status;
    all[idx] = {
      ...all[idx],
      status: 'Approved',
      approvedBy,
      remarks: remarks || all[idx].remarks,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { visitorEventService } = await import('./visitor-event.service');
    await visitorEventService.log(id, 'Approved', approvedBy, oldStatus, 'Approved', remarks || 'Visit approved');

    // Notify student
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(all[idx].studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Visitor Approved', message: `Visit from ${all[idx].visitorName} has been approved.`, type: 'Visitor', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async rejectVisitor(id: string, rejectedBy: string, remarks: string) {
    // Business rule: rejection requires remarks
    if (!remarks || remarks.trim() === '') {
      return { success: false, error: 'Remarks are required when rejecting a visitor' };
    }

    const all = this.getAllFromStorage();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return { success: false, error: 'Visitor not found' };

    const oldStatus = all[idx].status;
    all[idx] = {
      ...all[idx],
      status: 'Rejected',
      approvedBy: rejectedBy,
      remarks,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { visitorEventService } = await import('./visitor-event.service');
    await visitorEventService.log(id, 'Rejected', rejectedBy, oldStatus, 'Rejected', remarks);

    // Notify student
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(all[idx].studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Visitor Rejected', message: `Visit from ${all[idx].visitorName} has been rejected. Reason: ${remarks}`, type: 'Visitor', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async checkIn(id: string, checkInTime: string) {
    // Business rule: no check-in without approval
    const all = this.getAllFromStorage();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return { success: false, error: 'Visitor not found' };

    if (all[idx].status !== 'Approved') {
      return { success: false, error: `Cannot check in. Current status: ${all[idx].status}. Visit must be approved first.` };
    }

    const oldStatus = all[idx].status;
    all[idx] = {
      ...all[idx],
      status: 'Checked In',
      checkInTime,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { visitorEventService } = await import('./visitor-event.service');
    await visitorEventService.log(id, 'CheckedIn', undefined, oldStatus, 'Checked In', `Check-in at ${checkInTime}`);

    // Notify student
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(all[idx].studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Visitor Checked In', message: `${all[idx].visitorName} has checked in at ${checkInTime}.`, type: 'Visitor', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async checkOut(id: string, checkOutTime: string) {
    // Business rule: check-out only after check-in
    const all = this.getAllFromStorage();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return { success: false, error: 'Visitor not found' };

    if (all[idx].status !== 'Checked In') {
      return { success: false, error: `Cannot check out. Current status: ${all[idx].status}. Visitor must be Checked In first.` };
    }

    const oldStatus = all[idx].status;
    all[idx] = {
      ...all[idx],
      status: 'Checked Out',
      checkOutTime,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { visitorEventService } = await import('./visitor-event.service');
    await visitorEventService.log(id, 'CheckedOut', undefined, oldStatus, 'Checked Out', `Check-out at ${checkOutTime}`);

    // Notify student
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(all[idx].studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Visitor Checked Out', message: `${all[idx].visitorName} has checked out at ${checkOutTime}.`, type: 'Visitor', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async cancelVisit(id: string, remarks?: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return { success: false, error: 'Visitor not found' };

    if (all[idx].status === 'Checked Out') {
      return { success: false, error: 'Cannot cancel a completed visit' };
    }

    const oldStatus = all[idx].status;
    all[idx] = {
      ...all[idx],
      status: 'Cancelled',
      remarks: remarks || all[idx].remarks,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { visitorEventService } = await import('./visitor-event.service');
    await visitorEventService.log(id, 'Cancelled', undefined, oldStatus, 'Cancelled', remarks || 'Visit cancelled');

    return { success: true, data: all[idx] };
  }

  async updateVisitor(id: string, data: Partial<Omit<Visitor, 'id' | 'isDeleted' | 'createdAt'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return { success: false, error: 'Visitor not found' };

    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { visitorEventService } = await import('./visitor-event.service');
    await visitorEventService.log(id, 'Updated', undefined, undefined, undefined, 'Visitor details updated');

    return { success: true, data: all[idx] };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return { success: false, error: 'Visitor not found' };

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { visitorEventService } = await import('./visitor-event.service');
    await visitorEventService.log(id, 'Deleted', undefined, all[idx].status, undefined, 'Visitor record deleted');

    return { success: true, data: all[idx] };
  }

  async restore(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return { success: false, error: 'Visitor not found' };

    all[idx] = { ...all[idx], isDeleted: false, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { visitorEventService } = await import('./visitor-event.service');
    await visitorEventService.log(id, 'Restored', undefined, undefined, all[idx].status, 'Visitor record restored');

    return { success: true, data: all[idx] };
  }

  async getHistory(visitorId: string) {
    const { visitorEventService } = await import('./visitor-event.service');
    return visitorEventService.getByVisitor(visitorId);
  }
}

export const visitorService = new VisitorService();
