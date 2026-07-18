import { BaseService } from './base.service';
import type { HostelApplication } from '../types';
import { INITIAL_APPLICATIONS } from '../data';
import { generateId } from '../utils';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Approved', 'Rejected', 'Waitlisted', 'Cancelled'],
  Waitlisted: ['Approved', 'Rejected', 'Cancelled'],
  Approved: ['Cancelled'],
  Rejected: [],
  Cancelled: [],
};

class ApplicationService extends BaseService<HostelApplication> {
  constructor() {
    super('applications', INITIAL_APPLICATIONS as HostelApplication[]);
  }

  async getByStudent(studentId: string) {
    const all = this.getAllFromStorage().filter(a => !a.isDeleted);
    return { success: true, data: all.filter(a => a.studentId === studentId) };
  }

  async getByHostel(hostelId: string) {
    const all = this.getAllFromStorage().filter(a => !a.isDeleted);
    return { success: true, data: all.filter(a => a.preferredHostelId === hostelId) };
  }

  async getByStatus(status: string) {
    const all = this.getAllFromStorage().filter(a => !a.isDeleted);
    return { success: true, data: all.filter(a => a.status === status) };
  }

  async getActiveByStudent(studentId: string) {
    const all = this.getAllFromStorage().filter(a => !a.isDeleted);
    return { success: true, data: all.filter(a => a.studentId === studentId && a.status !== 'Cancelled' && a.status !== 'Rejected') };
  }

  async createApplication(data: {
    studentId: string; studentName: string; course: string; year: string;
    preferredHostelId: string; preferredHostel: string; preferredRoomType: string;
    academicYear: string; semester: string;
    reason?: string; specialRequirements?: string; medicalRequirements?: string;
    appliedDate: string;
  }) {
    const { studentService } = await import('./student.service');
    const stuRes = await studentService.getById(data.studentId);
    if (!stuRes.success || !stuRes.data || stuRes.data.isDeleted) {
      return { success: false, error: 'Student not found' };
    }

    const activeRes = await this.getActiveByStudent(data.studentId);
    if (activeRes.data && activeRes.data.length > 0) {
      return { success: false, error: 'Student already has an active application' };
    }

    const { allocationService } = await import('./allocation.service');
    const allocRes = await allocationService.getActive();
    if (allocRes && allocRes.length > 0) {
      const hasAlloc = allocRes.some(a => a.studentId === data.studentId && a.status === 'Active');
      if (hasAlloc) {
        return { success: false, error: 'Student already has an active room allocation' };
      }
    }

    const now = new Date().toISOString();
    const newApp: HostelApplication = {
      ...data,
      id: generateId(),
      status: 'Pending',
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    const { applicationEventService } = await import('./application-event.service');
    await applicationEventService.log(newApp.id, 'Created', undefined, undefined, 'Pending');

    const all = this.getAllFromStorage();
    all.push(newApp);
    this.saveToStorage(all);
    return { success: true, data: newApp };
  }

  async updateApplication(id: string, data: Partial<Omit<HostelApplication, 'id' | 'isDeleted'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Application not found' };

    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { applicationEventService } = await import('./application-event.service');
    await applicationEventService.log(id, 'Updated', undefined, undefined, undefined, 'Application details updated');

    return { success: true, data: all[idx] };
  }

  async approveApplication(id: string, reviewedBy: string, reviewRemarks?: string) {
    const result = await this.transitionStatus(id, 'Approved', reviewedBy, reviewRemarks);
    if (result.success && result.data) {
      const { notificationService } = await import('./notification.service');
      const { studentService } = await import('./student.service');
      const stuRes = await studentService.getById(result.data.studentId);
      if (stuRes.success && stuRes.data?.userId) {
        await notificationService.add({ userId: stuRes.data.userId, title: 'Application Approved', message: `Your hostel application has been approved.`, type: 'General', read: false, date: new Date().toISOString().split('T')[0] });
      }
    }
    return result;
  }

  async rejectApplication(id: string, reviewedBy: string, reviewRemarks?: string) {
    if (!reviewRemarks) {
      return { success: false, error: 'Review remarks are required for rejection' };
    }
    const result = await this.transitionStatus(id, 'Rejected', reviewedBy, reviewRemarks);
    if (result.success && result.data) {
      const { notificationService } = await import('./notification.service');
      const { studentService } = await import('./student.service');
      const stuRes = await studentService.getById(result.data.studentId);
      if (stuRes.success && stuRes.data?.userId) {
        await notificationService.add({ userId: stuRes.data.userId, title: 'Application Rejected', message: `Your hostel application has been rejected. Reason: ${reviewRemarks}`, type: 'General', read: false, date: new Date().toISOString().split('T')[0] });
      }
    }
    return result;
  }

  async waitlistApplication(id: string, reviewedBy: string, reviewRemarks?: string) {
    return this.transitionStatus(id, 'Waitlisted', reviewedBy, reviewRemarks);
  }

  async cancelApplication(id: string) {
    const result = await this.transitionStatus(id, 'Cancelled');
    if (result.success && result.data) {
      const { notificationService } = await import('./notification.service');
      const { studentService } = await import('./student.service');
      const stuRes = await studentService.getById(result.data.studentId);
      const userId = stuRes.success && stuRes.data?.userId ? stuRes.data.userId : 'u1';
      await notificationService.add({ userId, title: 'Application Cancelled', message: `Your hostel application has been cancelled.`, type: 'General', read: false, date: new Date().toISOString().split('T')[0] });
    }
    return result;
  }

  private async transitionStatus(id: string, newStatus: string, performedBy?: string, reviewRemarks?: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Application not found' };

    const app = all[idx];
    if (app.isDeleted) return { success: false, error: 'Application is deleted' };

    const allowed = STATUS_TRANSITIONS[app.status] || [];
    if (!allowed.includes(newStatus)) {
      return { success: false, error: `Cannot transition from '${app.status}' to '${newStatus}'` };
    }

    const oldStatus = app.status;
    all[idx] = {
      ...app,
      status: newStatus as HostelApplication['status'],
      reviewedBy: performedBy || app.reviewedBy,
      reviewedDate: new Date().toISOString().split('T')[0],
      reviewRemarks: reviewRemarks !== undefined ? reviewRemarks : app.reviewRemarks,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    const { applicationEventService } = await import('./application-event.service');
    await applicationEventService.log(
      id, 'StatusChanged', performedBy, oldStatus, newStatus,
      reviewRemarks ? `Status changed to ${newStatus}: ${reviewRemarks}` : `Status changed to ${newStatus}`,
    );

    return { success: true, data: all[idx] };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Application not found' };

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return { success: true, data: all[idx] };
  }

  async restore(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Application not found' };

    all[idx] = { ...all[idx], isDeleted: false, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return { success: true, data: all[idx] };
  }

  async getHistory(applicationId: string) {
    const { applicationEventService } = await import('./application-event.service');
    return applicationEventService.getByApplication(applicationId);
  }
}

export const applicationService = new ApplicationService();
