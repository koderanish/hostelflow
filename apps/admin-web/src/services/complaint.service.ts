import { BaseService } from './base.service';
import type { Complaint } from '../types';
import { INITIAL_COMPLAINTS } from '../data';
import { generateId } from '../utils';

class ComplaintService extends BaseService<Complaint> {
  constructor() {
    super('complaints', INITIAL_COMPLAINTS as Complaint[]);
  }

  async getByStudent(studentId: string) {
    const all = this.getAllFromStorage().filter(c => !c.isDeleted);
    return { success: true, data: all.filter(c => c.studentId === studentId) };
  }

  async getByStatus(status: string) {
    const all = this.getAllFromStorage().filter(c => !c.isDeleted);
    return { success: true, data: all.filter(c => c.status === status) };
  }

  async createComplaint(data: {
    studentId: string; studentName: string;
    roomId: string; roomNo: string;
    title: string; description: string;
    category: Complaint['category'];
    priority: Complaint['priority'];
  }) {
    // Business rule: student must exist
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(data.studentId);
    if (!stuRes.success || !stuRes.data || stuRes.data.isDeleted) {
      return { success: false, error: 'Student not found' };
    }

    // Business rule: room must exist
    const { roomService } = await import('./room.service');
    const roomRes = await roomService.getById(data.roomId);
    if (!roomRes.success || !roomRes.data) {
      return { success: false, error: 'Room not found' };
    }

    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      id: generateId(),
      studentId: data.studentId,
      studentName: data.studentName,
      title: data.title,
      description: data.description,
      category: data.category,
      roomId: data.roomId,
      roomNo: data.roomNo,
      priority: data.priority,
      status: 'Open',
      dateAdded: now.split('T')[0],
      createdAt: now,
      updatedAt: now,
    };

    const all = this.getAllFromStorage();
    all.push(newComplaint);
    this.saveToStorage(all);

    const { complaintEventService } = await import('./complaint-event.service');
    await complaintEventService.log(newComplaint.id, 'Created', undefined, undefined, 'Open', `Complaint raised: ${data.title}`);

    return { success: true, data: newComplaint };
  }

  async updateComplaint(id: string, data: Partial<Omit<Complaint, 'id' | 'isDeleted' | 'createdAt' | 'status'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, error: 'Complaint not found' };

    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { complaintEventService } = await import('./complaint-event.service');
    await complaintEventService.log(id, 'Updated', undefined, undefined, undefined, 'Complaint details updated');

    return { success: true, data: all[idx] };
  }

  async assignStaff(id: string, staffId: string, staffName: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, error: 'Complaint not found' };

    all[idx] = {
      ...all[idx],
      assignedTo: staffId,
      assignedToName: staffName,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { complaintEventService } = await import('./complaint-event.service');
    await complaintEventService.log(id, 'Assigned', undefined, all[idx].status, all[idx].status, `Assigned to ${staffName}`);

    // Notify staff
    const { notificationService } = await import('./notification.service');
    await notificationService.add({ userId: staffId, title: 'Complaint Assigned', message: `Complaint "${all[idx].title}" has been assigned to you.`, type: 'General', read: false, date: new Date().toISOString().split('T')[0] });

    return { success: true, data: all[idx] };
  }

  async markInProgress(id: string) {
    // Business rule: only Open complaints can move to In Progress
    const all = this.getAllFromStorage();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, error: 'Complaint not found' };

    if (all[idx].status !== 'Open') {
      return { success: false, error: `Cannot move to In Progress. Current status: ${all[idx].status}. Only Open complaints can move to In Progress.` };
    }

    const oldStatus = all[idx].status;
    all[idx] = { ...all[idx], status: 'In Progress', updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { complaintEventService } = await import('./complaint-event.service');
    await complaintEventService.log(id, 'StatusChanged', undefined, oldStatus, 'In Progress', 'Complaint moved to In Progress');

    // Notify student
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(all[idx].studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Complaint In Progress', message: `Your complaint "${all[idx].title}" is now being worked on.`, type: 'General', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async resolveComplaint(id: string, resolutionNotes: string) {
    // Business rule: resolution notes required before resolving
    if (!resolutionNotes || resolutionNotes.trim() === '') {
      return { success: false, error: 'Resolution notes are required before resolving a complaint' };
    }

    // Business rule: only In Progress complaints can be Resolved
    const all = this.getAllFromStorage();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, error: 'Complaint not found' };

    if (all[idx].status !== 'In Progress') {
      return { success: false, error: `Cannot resolve. Current status: ${all[idx].status}. Only In Progress complaints can be resolved.` };
    }

    const oldStatus = all[idx].status;
    const now = new Date().toISOString().split('T')[0];
    all[idx] = {
      ...all[idx],
      status: 'Resolved',
      resolvedDate: now,
      resolutionNotes,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { complaintEventService } = await import('./complaint-event.service');
    await complaintEventService.log(id, 'Resolved', undefined, oldStatus, 'Resolved', resolutionNotes);

    // Notify student
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(all[idx].studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Complaint Resolved', message: `Your complaint "${all[idx].title}" has been resolved. Notes: ${resolutionNotes}`, type: 'Complaint Resolved', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async closeComplaint(id: string) {
    // Business rule: only Resolved complaints can be Closed
    const all = this.getAllFromStorage();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, error: 'Complaint not found' };

    if (all[idx].status !== 'Resolved') {
      return { success: false, error: `Cannot close. Current status: ${all[idx].status}. Only Resolved complaints can be closed.` };
    }

    const oldStatus = all[idx].status;
    all[idx] = { ...all[idx], status: 'Closed', updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { complaintEventService } = await import('./complaint-event.service');
    await complaintEventService.log(id, 'Closed', undefined, oldStatus, 'Closed', 'Complaint closed');

    // Notify student
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(all[idx].studentId);
    if (stuRes.success && stuRes.data?.userId) {
      const { notificationService } = await import('./notification.service');
      await notificationService.add({ userId: stuRes.data.userId, title: 'Complaint Closed', message: `Your complaint "${all[idx].title}" has been closed.`, type: 'General', read: false, date: new Date().toISOString().split('T')[0] });
    }

    return { success: true, data: all[idx] };
  }

  async rejectComplaint(id: string, remarks: string) {
    if (!remarks || remarks.trim() === '') {
      return { success: false, error: 'Remarks are required when rejecting a complaint' };
    }

    const all = this.getAllFromStorage();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, error: 'Complaint not found' };

    if (all[idx].status !== 'Open') {
      return { success: false, error: `Cannot reject. Current status: ${all[idx].status}. Only Open complaints can be rejected.` };
    }

    const oldStatus = all[idx].status;
    all[idx] = {
      ...all[idx],
      status: 'Rejected',
      resolutionNotes: remarks,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { complaintEventService } = await import('./complaint-event.service');
    await complaintEventService.log(id, 'Rejected', undefined, oldStatus, 'Rejected', remarks);

    return { success: true, data: all[idx] };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, error: 'Complaint not found' };

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { complaintEventService } = await import('./complaint-event.service');
    await complaintEventService.log(id, 'Deleted', undefined, all[idx].status, undefined, 'Complaint record deleted');

    return { success: true, data: all[idx] };
  }

  async restore(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, error: 'Complaint not found' };

    all[idx] = { ...all[idx], isDeleted: false, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { complaintEventService } = await import('./complaint-event.service');
    await complaintEventService.log(id, 'Restored', undefined, undefined, all[idx].status, 'Complaint record restored');

    return { success: true, data: all[idx] };
  }

  async getHistory(complaintId: string) {
    const { complaintEventService } = await import('./complaint-event.service');
    return complaintEventService.getByComplaint(complaintId);
  }
}

export const complaintService = new ComplaintService();
