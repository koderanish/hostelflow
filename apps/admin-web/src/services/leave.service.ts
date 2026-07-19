import { api } from '../api/client';
import type { ApiResponse, LeaveRequest } from '../types';

function toLeave(d: any): LeaveRequest {
  return {
    id: d.id,
    studentId: d.studentId || '',
    studentName: d.studentName || '',
    leaveType: d.leaveType || 'Personal',
    fromDate: d.fromDate || '',
    toDate: d.toDate || '',
    reason: d.reason || '',
    status: d.status || 'Pending',
    approvedBy: d.approvedBy || undefined,
    remarks: d.remarks || undefined,
    isDeleted: d.isDeleted || false,
    createdAt: d.createdAt || '',
    updatedAt: d.updatedAt || '',
  };
}

function extractList(res: any): LeaveRequest[] {
  if (!res.success) return [];
  const raw = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
  return Array.isArray(raw) ? raw.map(toLeave) : [];
}

class LeaveService {
  async getAll(): Promise<ApiResponse<LeaveRequest[]>> {
    const res = await api.get<any>('/leaves?limit=1000');
    return { success: true, data: extractList(res) };
  }

  async getByStudent(studentId: string): Promise<ApiResponse<LeaveRequest[]>> {
    const res = await api.get<any>(`/leaves?studentId=${studentId}&limit=50`);
    return { success: true, data: extractList(res) };
  }

  async getById(id: string): Promise<ApiResponse<LeaveRequest>> {
    const res = await api.get<any>(`/leaves/${id}`);
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toLeave(d) };
    }
    return { success: false, error: 'Leave not found' };
  }

  async getPaginated(page = 1, limit = 15, search?: string, filters?: Record<string, string>, sortBy?: string, sortOrder?: string): Promise<ApiResponse<{ data: LeaveRequest[]; totalPages: number; total: number }>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    }
    const res = await api.get<any>(`/leaves?${params}`);
    const data = extractList(res);
    const total = res.data?.total ?? data.length;
    return { success: true, data: { data, totalPages: Math.ceil(total / limit), total } };
  }

  async applyLeave(data: {
    studentId: string; leaveType: string;
    fromDate: string; toDate: string;
    reason: string; remarks?: string;
    studentName?: string;
  }): Promise<ApiResponse<LeaveRequest>> {
    const res = await api.post<any>('/leaves', data);
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toLeave(d) };
    }
    return { success: false, error: 'Failed to apply leave' };
  }

  async approveLeave(id: string, approvedBy: string, remarks?: string): Promise<ApiResponse<LeaveRequest>> {
    const res = await api.post<any>(`/leaves/${id}/approve`, { approvedBy, remarks });
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toLeave(d) };
    }
    return { success: false, error: res.message || 'Failed to approve' };
  }

  async rejectLeave(id: string, approvedBy: string, remarks: string): Promise<ApiResponse<LeaveRequest>> {
    const res = await api.post<any>(`/leaves/${id}/reject`, { approvedBy, remarks });
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toLeave(d) };
    }
    return { success: false, error: res.message || 'Failed to reject' };
  }

  async cancelLeave(id: string): Promise<ApiResponse<LeaveRequest>> {
    const res = await api.post<any>(`/leaves/${id}/cancel`);
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toLeave(d) };
    }
    return { success: false, error: res.message || 'Failed to cancel' };
  }

  async softDelete(id: string): Promise<ApiResponse<LeaveRequest>> {
    await api.delete(`/leaves/${id}`);
    return { success: true, data: undefined as any };
  }

  async getHistory(leaveId: string): Promise<ApiResponse<any[]>> {
    try {
      const res = await api.get<any>(`/leaves/${leaveId}/history`);
      return { success: true, data: res.data?.data ?? [] };
    } catch {
      return { success: true, data: [] };
    }
  }
}

export const leaveService = new LeaveService();
