import { BaseService } from './base.service';
import type { Student } from '../types';
import { INITIAL_STUDENTS } from '../data';
import { generateId } from '../utils';

class StudentService extends BaseService<Student> {
  constructor() {
    super('students', INITIAL_STUDENTS as Student[]);
  }

  async getByHostel(hostelId: string) {
    const all = this.getAllFromStorage().filter(s => !s.isDeleted);
    return { success: true, data: all.filter(s => s.hostelId === hostelId) };
  }

  async getUnallocated() {
    const all = this.getAllFromStorage().filter(s => !s.isDeleted);
    return { success: true, data: all.filter(s => !s.hostelId || !s.roomId) };
  }

  async getByUserId(userId: string) {
    const student = this.getAllFromStorage().find(s => s.userId === userId && !s.isDeleted);
    return { success: true, data: student };
  }

  async checkEnrollmentUnique(enrollmentNo: string, excludeId?: string) {
    const exists = this.getAllFromStorage().some(
      s => s.enrollmentNo === enrollmentNo && s.id !== excludeId && !s.isDeleted,
    );
    return { success: true, data: exists };
  }

  async checkEmailUnique(email: string, excludeId?: string) {
    const exists = this.getAllFromStorage().some(
      s => s.email === email && s.id !== excludeId && !s.isDeleted,
    );
    return { success: true, data: exists };
  }

  async createStudent(data: Omit<Student, 'id' | 'isDeleted' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const newStudent: Student = {
      ...data,
      id: generateId(),
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    const { studentEventService } = await import('./student-event.service');
    await studentEventService.log(newStudent.id, 'Created', undefined, undefined, data.status);

    const all = this.getAllFromStorage();
    all.push(newStudent);
    this.saveToStorage(all);
    return { success: true, data: newStudent };
  }

  async updateStudent(id: string, data: Partial<Omit<Student, 'id' | 'isDeleted'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, error: 'Student not found' };

    const oldStatus = all[idx].status;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    if (data.status && data.status !== oldStatus) {
      const { studentEventService } = await import('./student-event.service');
      await studentEventService.log(id, 'StatusChanged', undefined, oldStatus, data.status);
    }

    const { studentEventService } = await import('./student-event.service');
    await studentEventService.log(id, 'Updated', undefined, undefined, undefined, 'Student details updated');

    return { success: true, data: all[idx] };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, error: 'Student not found' };

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { studentEventService } = await import('./student-event.service');
    await studentEventService.log(id, 'StatusChanged', undefined, all[idx].status, undefined, 'Student deleted');

    return { success: true, data: all[idx] };
  }

  async restore(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, error: 'Student not found' };

    all[idx] = { ...all[idx], isDeleted: false, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);

    const { studentEventService } = await import('./student-event.service');
    await studentEventService.log(id, 'StatusChanged', undefined, undefined, all[idx].status, 'Student restored');

    return { success: true, data: all[idx] };
  }

  async getHistory(studentId: string) {
    const { studentEventService } = await import('./student-event.service');
    return studentEventService.getByStudent(studentId);
  }
}

export const studentService = new StudentService();
