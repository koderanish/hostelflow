import { api } from '../api/client';
import type { ApiResponse } from './types';

export interface Complaint {
  id: string;
  studentId: string;
  studentName?: string;
  title: string;
  description: string;
  category: string;
  roomId: string;
  roomNo?: string;
  priority: string;
  status: string;
  assignedTo?: string;
  assignedToName?: string;
  dateAdded?: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateComplaintPayload {
  studentId: string;
  title: string;
  description: string;
  category: string;
  roomId: string;
  roomNo?: string;
  priority: string;
  studentName?: string;
}

class ComplaintService {
  async create(data: CreateComplaintPayload): Promise<ApiResponse<Complaint>> {
    try {
      const response = await api.post('/complaints', data);
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Failed to create complaint' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to create complaint' };
    }
  }

  async getByStudent(studentId: string): Promise<ApiResponse<Complaint[]>> {
    try {
      const response = await api.get(`/complaints?studentId=${studentId}`);
      const res = response.data;
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        return { success: true, data };
      }
      return { success: false, error: res.message || 'Failed to fetch complaints' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch complaints' };
    }
  }

  async getById(id: string): Promise<ApiResponse<Complaint>> {
    try {
      const response = await api.get(`/complaints/${id}`);
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Complaint not found' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch complaint' };
    }
  }
}

export const complaintService = new ComplaintService();
