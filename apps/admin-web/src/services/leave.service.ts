import { BaseService } from './base.service';
import type { LeaveRequest } from '../types';
import { INITIAL_LEAVE_REQUESTS } from '../data';
import { generateId } from '../utils';

class LeaveService extends BaseService<LeaveRequest> {
  constructor() {
    super('leaves', INITIAL_LEAVE_REQUESTS as LeaveRequest[]);
  }

  async getByStudent(studentId: string) {
    const all = this.getAllFromStorage().filter(l => !l.isDeleted);
    return { success: true, data: all.filter(l => l.studentId === studentId) };
  }

  async getByStatus(status: string) {
    const all = this.getAllFromStorage().filter(l => !l.isDeleted);
    return { success: true, data: all.filter(l => l.status === status) };
  }

  async getPending() {
    return this.getByStatus('Pending');
  }

  async applyLeave(data: {
    studentId: string; studentName: string;
    leaveType: LeaveRequest['leaveType'];
    fromDate: string; toDate: string;
    reason: string; remarks?: string;
  }) {
    // Business rule: end date >= start date
    if (data.toDate < data.fromDate) {
      return { success: false, error: 'End date cannot be before start date' };
    }

    // Business rule: no overlapping approved leaves
    const existing = this.getAllFromStorage().filter(l => !l.isDeleted && l.studentId === data.studentId && l.status !== 'Cancelled');
    const overlap = existing.some(l =>
      l.fromDate <= data.toDate && l.toDate >= data.fromDate
    );
    if (overlap) {
      return { success: false, error: 'An approved or pending leave already exists in this date range' };
    }

    const now = new Date().toISOString();
    const newLeave: LeaveRequest = {
      id: generateId(),
      studentId: data.studentId,
      studentName: data.studentName,
      leaveType: data.leaveType,
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
      status: 'Pending',
      remarks: data.remarks,
      createdAt: now,
      updatedAt: now,
    };

    const all = this.getAllFromStorage();
    all.push(newLeave);
    this.saveToStorage(all);

    const { leaveEventService } = await import('./leave-event.service');
    await leaveEventService.log(newLeave.id, 'Applied', undefined, undefined, 'Pending', `Leave applied: ${data.leaveType} (${data.fromDate} to ${data.toDate})`);

    return { success: true, data: newLeave };
  }

  async updateLeave(id: string, data: Partial<Omit<LeaveRequest, 'id' | 'isDeleted' | 'createdAt' | 'status'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(l => l.id === id);
    if (idx === -1) return { success: false, error: 'Leave not found' };

    // Business rule: cancelled leaves cannot be updated
    if (all[idx].status === 'Cancelled') {
      return { success: false, error: 'Cannot update a cancelled leave request' };
    }

    if (data.fromDate && data.toDate && data.toDate < data.fromDate) {
      return { success: false, error: 'End date cannot be before start date' };
    }

    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { leaveEventService } = await import('./leave-event.service');
    await leaveEventService.log(id, 'Updated', undefined, undefined, undefined, 'Leave details updated');

    return { success: true, data: all[idx] };
  }

  async approveLeave(id: string, approvedBy: string, remarks?: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(l => l.id === id);
    if (idx === -1) return { success: false, error: 'Leave not found' };

    // Business rule: cancelled leaves cannot be approved
    if (all[idx].status === 'Cancelled') {
      return { success: false, error: 'Cannot approve a cancelled leave request' };
    }

    const oldStatus = all[idx].status;
    const now = new Date().toISOString().split('T')[0];

    all[idx] = {
      ...all[idx],
      status: 'Approved',
      approvedBy,
      reviewedDate: now,
      remarks: remarks || all[idx].remarks,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    // Business rule: approved leave integrates with Attendance
    // (Attendance integration: when approved, attendance for the leave period should be marked as Leave)
    try {
      const { attendanceService } = await import('./attendance.service');
      const from = all[idx].fromDate;
      const to = all[idx].toDate;
      const current = new Date(from);
      const end = new Date(to);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        // Check if attendance already exists for this date
        const existingAtt = await attendanceService.getByDate(dateStr);
        const existing = existingAtt.data?.find(a => a.studentId === all[idx].studentId);
        if (!existing) {
          await attendanceService.createAttendance({
            studentId: all[idx].studentId,
            studentName: all[idx].studentName,
            date: dateStr,
            status: 'Leave',
            remarks: `Auto-marked from approved leave: ${all[idx].reason}`,
          });
        } else if (existing.status !== 'Leave') {
          await attendanceService.updateAttendance(existing.id, {
            status: 'Leave',
            remarks: `Auto-marked from approved leave: ${all[idx].reason}`,
          });
        }
        current.setDate(current.getDate() + 1);
      }
    } catch {
      // Attendance integration is best-effort
    }

    const { leaveEventService } = await import('./leave-event.service');
    await leaveEventService.log(id, 'Approved', approvedBy, oldStatus, 'Approved', remarks || 'Leave approved');

    // Notify student
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(all[idx].studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Leave Approved', message: `Your leave (${all[idx].leaveType}) from ${all[idx].fromDate} to ${all[idx].toDate} has been approved.`, type: 'Leave Approved', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async rejectLeave(id: string, rejectedBy: string, remarks: string) {
    // Business rule: rejection requires remarks
    if (!remarks || remarks.trim() === '') {
      return { success: false, error: 'Remarks are required when rejecting a leave request' };
    }

    const all = this.getAllFromStorage();
    const idx = all.findIndex(l => l.id === id);
    if (idx === -1) return { success: false, error: 'Leave not found' };

    // Business rule: cancelled leaves cannot be rejected
    if (all[idx].status === 'Cancelled') {
      return { success: false, error: 'Cannot reject a cancelled leave request' };
    }

    const oldStatus = all[idx].status;

    all[idx] = {
      ...all[idx],
      status: 'Rejected',
      approvedBy: rejectedBy,
      reviewedDate: new Date().toISOString().split('T')[0],
      remarks,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { leaveEventService } = await import('./leave-event.service');
    await leaveEventService.log(id, 'Rejected', rejectedBy, oldStatus, 'Rejected', remarks);

    // Notify student
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(all[idx].studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Leave Rejected', message: `Your leave request has been rejected. Reason: ${remarks}`, type: 'Leave Rejected', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async cancelLeave(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(l => l.id === id);
    if (idx === -1) return { success: false, error: 'Leave not found' };

    // Business rule: cancelled leaves cannot be approved (enforced in approveLeave)
    if (all[idx].status === 'Approved') {
      return { success: false, error: 'Cannot cancel an already approved leave. Contact the warden.' };
    }

    const oldStatus = all[idx].status;
    all[idx] = { ...all[idx], status: 'Cancelled', updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { leaveEventService } = await import('./leave-event.service');
    await leaveEventService.log(id, 'Cancelled', undefined, oldStatus, 'Cancelled', 'Leave cancelled by applicant');

    // Notify admin
    const { notificationService } = await import('./notification.service');
    await notificationService.add({ userId: 'u1', title: 'Leave Cancelled', message: `Leave cancelled by ${all[idx].studentName}.`, type: 'General', read: false, date: new Date().toISOString().split('T')[0] });

    return { success: true, data: all[idx] };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(l => l.id === id);
    if (idx === -1) return { success: false, error: 'Leave not found' };

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { leaveEventService } = await import('./leave-event.service');
    await leaveEventService.log(id, 'Deleted', undefined, all[idx].status, undefined, 'Leave record deleted');

    return { success: true, data: all[idx] };
  }

  async restore(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(l => l.id === id);
    if (idx === -1) return { success: false, error: 'Leave not found' };

    all[idx] = { ...all[idx], isDeleted: false, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { leaveEventService } = await import('./leave-event.service');
    await leaveEventService.log(id, 'Restored', undefined, undefined, all[idx].status, 'Leave record restored');

    return { success: true, data: all[idx] };
  }

  async getHistory(leaveId: string) {
    const { leaveEventService } = await import('./leave-event.service');
    return leaveEventService.getByLeave(leaveId);
  }

  async getActiveByStudent(studentId: string) {
    const all = this.getAllFromStorage().filter(l => !l.isDeleted && l.studentId === studentId);
    return { success: true, data: all.filter(l => l.status === 'Pending' || l.status === 'Approved') };
  }
}

export const leaveService = new LeaveService();
