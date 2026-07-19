import { api } from '../api/client';
import type { ApiResponse, Complaint } from '../types';

function toCmp(d: any): Complaint {
  return {
    id: d.id,
    studentId: d.studentId || '',
    studentName: d.studentName || '',
    title: d.title || '',
    description: d.description || '',
    category: d.category || 'Other',
    roomId: d.roomId || '',
    roomNo: d.roomNo || '',
    priority: d.priority || 'Medium',
    status: d.status || 'Open',
    assignedTo: d.assignedTo || undefined,
    assignedToName: d.assignedToName || '',
    dateAdded: d.dateAdded || '',
    resolvedDate: d.resolvedDate || undefined,
    resolutionNotes: d.resolutionNotes || undefined,
    isDeleted: d.isDeleted || false,
    createdAt: d.createdAt || '',
    updatedAt: d.updatedAt || '',
  };
}

function extractList(res: any): Complaint[] {
  if (!res.success) return [];
  const raw = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
  return Array.isArray(raw) ? raw.map(toCmp) : [];
}

class ComplaintService {
  async getAll(): Promise<ApiResponse<Complaint[]>> {
    const res = await api.get<any>('/complaints?limit=1000');
    return { success: true, data: extractList(res) };
  }

  async getByStudent(studentId: string): Promise<ApiResponse<Complaint[]>> {
    const res = await api.get<any>(`/complaints?studentId=${studentId}&limit=50`);
    return { success: true, data: extractList(res) };
  }

  async getById(id: string): Promise<ApiResponse<Complaint>> {
    const res = await api.get<any>(`/complaints/${id}`);
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toCmp(d) };
    }
    return { success: false, error: 'Complaint not found' };
  }

  async getPaginated(page = 1, limit = 15, search?: string, filters?: Record<string, string>, sortBy?: string, sortOrder?: string): Promise<ApiResponse<{ data: Complaint[]; totalPages: number; total: number }>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    }
    const res = await api.get<any>(`/complaints?${params}`);
    const data = extractList(res);
    const total = res.data?.total ?? data.length;
    return { success: true, data: { data, totalPages: Math.ceil(total / limit), total } };
  }

  async createComplaint(data: {
    studentId: string; roomId: string; roomNo: string;
    title: string; description: string;
    category: string; priority: string;
    studentName?: string;
  }): Promise<ApiResponse<Complaint>> {
    const res = await api.post<any>('/complaints', data);
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toCmp(d) };
    }
    return { success: false, error: 'Failed to create complaint' };
  }

  async assignStaff(id: string, staffId: string, staffName: string): Promise<ApiResponse<Complaint>> {
    const res = await api.post<any>(`/complaints/${id}/assign`, { staffId, staffName });
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toCmp(d) };
    }
    return { success: false, error: 'Failed to assign staff' };
  }

  async markInProgress(id: string): Promise<ApiResponse<Complaint>> {
    const res = await api.post<any>(`/complaints/${id}/in-progress`);
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toCmp(d) };
    }
    return { success: false, error: 'Failed to mark in progress' };
  }

  async resolveComplaint(id: string, resolutionNotes: string): Promise<ApiResponse<Complaint>> {
    const res = await api.post<any>(`/complaints/${id}/resolve`, { resolutionNotes });
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toCmp(d) };
    }
    return { success: false, error: 'Failed to resolve complaint' };
  }

  async closeComplaint(id: string): Promise<ApiResponse<Complaint>> {
    const res = await api.post<any>(`/complaints/${id}/close`);
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toCmp(d) };
    }
    return { success: false, error: 'Failed to close complaint' };
  }

  async rejectComplaint(id: string, remarks: string): Promise<ApiResponse<Complaint>> {
    const res = await api.post<any>(`/complaints/${id}/reject`, { remarks });
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toCmp(d) };
    }
    return { success: false, error: 'Failed to reject complaint' };
  }

  async softDelete(id: string): Promise<ApiResponse<Complaint>> {
    await api.delete(`/complaints/${id}`);
    return { success: true, data: undefined as any };
  }

  async getHistory(complaintId: string): Promise<ApiResponse<any[]>> {
    try {
      const res = await api.get<any>(`/complaints/${complaintId}/history`);
      return { success: true, data: res.data?.data ?? [] };
    } catch {
      return { success: true, data: [] };
    }
  }
}

export const complaintService = new ComplaintService();
