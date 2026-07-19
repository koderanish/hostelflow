import { api } from '../api/client';
import type { ApiResponse } from './types';

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName?: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
  approvedBy?: string;
  remarks?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplyLeavePayload {
  studentId: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  studentName?: string;
  remarks?: string;
}

class LeaveService {
  async applyLeave(data: ApplyLeavePayload): Promise<ApiResponse<LeaveRequest>> {
    try {
      const response = await api.post('/leaves', data);
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Failed to apply leave' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to apply leave' };
    }
  }

  async getByStudent(studentId: string): Promise<ApiResponse<LeaveRequest[]>> {
    try {
      const response = await api.get(`/leaves?studentId=${studentId}`);
      const res = response.data;
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        return { success: true, data };
      }
      return { success: false, error: res.message || 'Failed to fetch leaves' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch leaves' };
    }
  }

  async getById(id: string): Promise<ApiResponse<LeaveRequest>> {
    try {
      const response = await api.get(`/leaves/${id}`);
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Leave not found' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch leave' };
    }
  }

  async cancelLeave(id: string): Promise<ApiResponse<LeaveRequest>> {
    try {
      const response = await api.post(`/leaves/${id}/cancel`);
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Failed to cancel leave' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to cancel leave' };
    }
  }
}

export const leaveService = new LeaveService();
