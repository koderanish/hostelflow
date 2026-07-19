import { api } from '../api/client';
import type { ApiResponse } from './types';

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  bloodGroup?: string;
  address: string;
  enrollmentNo: string;
  registrationNo?: string;
  department: string;
  course: string;
  year: string;
  semester: string;
  parentName: string;
  parentContact: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  hostelId?: string;
  hostelName?: string;
  roomId?: string;
  roomNo?: string;
  status: string;
  feeStatus: string;
  admissionDate: string;
  createdAt?: string;
  updatedAt?: string;
}

class StudentService {
  async getByUserId(userId: string): Promise<ApiResponse<StudentProfile>> {
    try {
      const response = await api.get(`/students/by-user/${userId}`);
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Student not found' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch student' };
    }
  }

  async getById(id: string): Promise<ApiResponse<StudentProfile>> {
    try {
      const response = await api.get(`/students/${id}`);
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Student not found' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch student' };
    }
  }

  async update(id: string, data: Partial<StudentProfile>): Promise<ApiResponse<StudentProfile>> {
    try {
      const response = await api.patch(`/students/${id}`, data);
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Failed to update student' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to update student' };
    }
  }
}

export const studentService = new StudentService();
