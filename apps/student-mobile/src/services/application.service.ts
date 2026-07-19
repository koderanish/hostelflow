import { api } from '../api/client';
import type { ApiResponse } from './types';

export interface HostelApplication {
  id: string;
  studentId: string;
  studentName?: string;
  course: string;
  year: string;
  preferredHostelId: string;
  preferredHostel?: string;
  preferredRoomType?: string;
  academicYear?: string;
  semester?: string;
  reason?: string;
  specialRequirements?: string;
  medicalRequirements?: string;
  status: string;
  appliedDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewRemarks?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateApplicationPayload {
  studentId: string;
  course?: string;
  year?: string;
  preferredHostelId: string;
  preferredRoomType?: string;
  academicYear?: string;
  semester?: string;
  reason?: string;
  specialRequirements?: string;
  medicalRequirements?: string;
  studentName?: string;
}

class ApplicationService {
  async create(data: CreateApplicationPayload): Promise<ApiResponse<HostelApplication>> {
    try {
      const response = await api.post('/applications', data);
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Failed to create application' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to create application' };
    }
  }

  async getByStudent(studentId: string): Promise<ApiResponse<HostelApplication[]>> {
    try {
      const response = await api.get(`/applications?studentId=${studentId}`);
      const res = response.data;
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        return { success: true, data };
      }
      return { success: false, error: res.message || 'Failed to fetch applications' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch applications' };
    }
  }

  async getById(id: string): Promise<ApiResponse<HostelApplication>> {
    try {
      const response = await api.get(`/applications/${id}`);
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Application not found' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch application' };
    }
  }
}

export const applicationService = new ApplicationService();
