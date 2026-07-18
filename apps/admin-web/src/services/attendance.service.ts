import { BaseService } from './base.service';
import type { Attendance, PaginatedResponse } from '../types';
import { INITIAL_ATTENDANCE } from '../data';
import { generateId } from '../utils';

const DEFAULT_LATE_CUTOFF = '21:30';

class AttendanceService extends BaseService<Attendance> {
  constructor() {
    super('attendance', INITIAL_ATTENDANCE as Attendance[]);
  }

  async getByDate(date: string) {
    const all = this.getAllFromStorage().filter(a => !a.isDeleted);
    return { success: true, data: all.filter(a => a.date === date) };
  }

  async getByStudent(studentId: string) {
    const all = this.getAllFromStorage().filter(a => !a.isDeleted);
    return { success: true, data: all.filter(a => a.studentId === studentId) };
  }

  async getByStudentDateRange(studentId: string, fromDate: string, toDate: string) {
    const all = this.getAllFromStorage().filter(a => !a.isDeleted && a.studentId === studentId);
    return { success: true, data: all.filter(a => a.date >= fromDate && a.date <= toDate) };
  }

  async createAttendance(data: {
    studentId: string; studentName: string;
    date: string; checkInTime?: string;
    checkOutTime?: string; status: Attendance['status'];
    remarks?: string;
  }) {
    // Business rule: one attendance record per student per day
    const existing = this.getAllFromStorage().filter(a => !a.isDeleted);
    const dup = existing.find(
      a => a.studentId === data.studentId && a.date === data.date
    );
    if (dup) {
      return { success: false, error: `Attendance already exists for ${data.studentName} on ${data.date}`, data: dup };
    }

    // Business rule: auto-detect late if checkInTime exceeds cutoff
    let status = data.status;
    if (status === 'Present' && data.checkInTime && data.checkInTime > DEFAULT_LATE_CUTOFF) {
      status = 'Late';
    }

    const now = new Date().toISOString();
    const newAttendance: Attendance = {
      id: generateId(),
      studentId: data.studentId,
      studentName: data.studentName,
      date: data.date,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      status,
      remarks: data.remarks,
      createdAt: now,
      updatedAt: now,
    };

    const all = this.getAllFromStorage();
    all.push(newAttendance);
    this.saveToStorage(all);

    const { attendanceEventService } = await import('./attendance-event.service');
    await attendanceEventService.log(newAttendance.id, 'Created', undefined, undefined, status, `Attendance marked as ${status}`);

    return { success: true, data: newAttendance };
  }

  async updateAttendance(id: string, data: Partial<Omit<Attendance, 'id' | 'isDeleted' | 'createdAt'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Attendance not found' };

    const oldStatus = all[idx].status;
    let newStatus = data.status || oldStatus;

    // Auto-detect late
    if (newStatus === 'Present' && (data.checkInTime || all[idx].checkInTime)) {
      const inTime = data.checkInTime || all[idx].checkInTime;
      if (inTime && inTime > DEFAULT_LATE_CUTOFF) {
        newStatus = 'Late';
      }
    }

    all[idx] = {
      ...all[idx],
      ...data,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(all);

    if (data.status && data.status !== oldStatus) {
      const { attendanceEventService } = await import('./attendance-event.service');
      await attendanceEventService.log(id, 'StatusChanged', undefined, oldStatus, newStatus, `Status changed from ${oldStatus} to ${newStatus}`);
    }

    return { success: true, data: all[idx] };
  }

  async markBulkAttendance(items: Array<{
    studentId: string; studentName: string;
    date: string; checkInTime?: string;
    checkOutTime?: string; status: Attendance['status'];
    remarks?: string;
  }>) {
    const results: Attendance[] = [];
    const errors: { studentName: string; error: string }[] = [];

    for (const item of items) {
      const existing = this.getAllFromStorage().filter(a => !a.isDeleted);
      const dup = existing.find(a => a.studentId === item.studentId && a.date === item.date);
      if (dup) {
        // Update existing
        const updRes = await this.updateAttendance(dup.id, {
          checkInTime: item.checkInTime,
          checkOutTime: item.checkOutTime,
          status: item.status,
          remarks: item.remarks,
        });
        if (updRes.success && updRes.data) {
          results.push(updRes.data);
        }
      } else {
        const res = await this.createAttendance(item);
        if (res.success && res.data) {
          results.push(res.data);
        } else {
          errors.push({ studentName: item.studentName, error: (res as any).error || 'Failed' });
        }
      }
    }

    const { attendanceEventService } = await import('./attendance-event.service');
    if (results.length > 0) {
      await attendanceEventService.log(results[0].id, 'BulkMarked', undefined, undefined, undefined, `Bulk attendance marked for ${results.length} students`);
    }

    return { success: true, data: { results, errors, totalProcessed: items.length, successCount: results.length, errorCount: errors.length } };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Attendance not found' };

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { attendanceEventService } = await import('./attendance-event.service');
    await attendanceEventService.log(id, 'Deleted', undefined, all[idx].status, undefined, 'Attendance record deleted');

    return { success: true, data: all[idx] };
  }

  async restore(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Attendance not found' };

    all[idx] = { ...all[idx], isDeleted: false, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { attendanceEventService } = await import('./attendance-event.service');
    await attendanceEventService.log(id, 'Restored', undefined, undefined, all[idx].status, 'Attendance record restored');

    return { success: true, data: all[idx] };
  }

  async getReport(studentId?: string, fromDate?: string, toDate?: string) {
    let records = this.getAllFromStorage().filter(a => !a.isDeleted);

    if (studentId) {
      records = records.filter(a => a.studentId === studentId);
    }
    if (fromDate) {
      records = records.filter(a => a.date >= fromDate);
    }
    if (toDate) {
      records = records.filter(a => a.date <= toDate);
    }

    const total = records.length;
    const present = records.filter(a => a.status === 'Present').length;
    const absent = records.filter(a => a.status === 'Absent').length;
    const late = records.filter(a => a.status === 'Late').length;
    const leave = records.filter(a => a.status === 'Leave').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return {
      success: true,
      data: {
        total,
        present,
        absent,
        late,
        leave,
        percentage,
        records,
      },
    };
  }

  async getHistory(attendanceId: string) {
    const { attendanceEventService } = await import('./attendance-event.service');
    return attendanceEventService.getByAttendance(attendanceId);
  }

  checkLateStatus(checkInTime: string): boolean {
    return checkInTime > DEFAULT_LATE_CUTOFF;
  }

  getLateCutoff(): string {
    return DEFAULT_LATE_CUTOFF;
  }
}

export const attendanceService = new AttendanceService();
