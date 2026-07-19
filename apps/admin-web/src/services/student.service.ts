import { BaseService } from './base.service';
import { mockApiCall, mockPaginatedApiCall } from '../api/client';
import type { ApiResponse, PaginatedResponse, Student } from '../types';
import { INITIAL_STUDENTS } from '../data';
import { generateId } from '../utils';

class StudentService extends BaseService<Student> {
  constructor() {
    super('students', INITIAL_STUDENTS as Student[]);
  }

  protected async getAllLocally() {
    return this.getAllFromStorage().filter((s: any) => !s.isDeleted);
  }

  async getAll(): Promise<ApiResponse<Student[]>> {
    return mockApiCall(this.getAllFromStorage());
  }

  async getById(id: string): Promise<ApiResponse<Student>> {
    const item = this.getAllFromStorage().find(i => i.id === id);
    if (!item) return { success: false, error: 'Not found' };
    return mockApiCall(item);
  }

  async getPaginated(
    page = 1, limit = 10, search?: string,
    filters?: Record<string, string>, sortBy?: string, sortOrder?: 'asc' | 'desc'
  ): Promise<ApiResponse<PaginatedResponse<Student>>> {
    return mockPaginatedApiCall(this.getAllFromStorage(), page, limit, search, filters, sortBy, sortOrder);
  }

  async getByHostel(hostelId: string) {
    const data = await this.getAllLocally();
    return { success: true, data: data.filter(s => s.hostelId === hostelId) };
  }

  async getUnallocated() {
    const data = await this.getAllLocally();
    return { success: true, data: data.filter(s => !s.hostelId || !s.roomId) };
  }

  async getByUserId(userId: string) {
    const data = await this.getAllLocally();
    const student = data.find(s => s.userId === userId);
    return { success: true, data: student };
  }

  async checkEnrollmentUnique(enrollmentNo: string, excludeId?: string) {
    const data = await this.getAllLocally();
    const exists = data.some(
      s => s.enrollmentNo === enrollmentNo && s.id !== excludeId,
    );
    return { success: true, data: exists };
  }

  async checkEmailUnique(email: string, excludeId?: string) {
    const data = await this.getAllLocally();
    const exists = data.some(
      s => s.email === email && s.id !== excludeId,
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
