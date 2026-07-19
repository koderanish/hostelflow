import { api } from '../api/client';
import type { ApiResponse, HostelApplication } from '../types';

function toApp(d: any): HostelApplication {
  return {
    id: d.id,
    studentId: d.studentId || '',
    studentName: d.studentName || '',
    course: d.course || '',
    year: d.year || '',
    preferredHostelId: d.preferredHostelId || d.hostelId || '',
    preferredHostel: d.preferredHostel || '',
    preferredRoomType: d.preferredRoomType || '',
    academicYear: d.academicYear || '',
    semester: d.semester || '',
    reason: d.reason || '',
    specialRequirements: d.specialRequirements || '',
    medicalRequirements: d.medicalRequirements || '',
    status: d.status || 'Pending',
    appliedDate: d.appliedDate || '',
    reviewedBy: d.reviewedBy || undefined,
    reviewedDate: d.reviewedDate || undefined,
    reviewRemarks: d.reviewRemarks || undefined,
    isDeleted: d.isDeleted || false,
    createdAt: d.createdAt || '',
    updatedAt: d.updatedAt || '',
  };
}

function extractList(res: any): HostelApplication[] {
  if (!res.success) return [];
  const raw = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
  return Array.isArray(raw) ? raw.map(toApp) : [];
}

class ApplicationService {
  async getAll(): Promise<ApiResponse<HostelApplication[]>> {
    const res = await api.get<any>('/applications?limit=1000');
    return { success: true, data: extractList(res) };
  }

  async getById(id: string): Promise<ApiResponse<HostelApplication>> {
    const res = await api.get<any>(`/applications/${id}`);
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toApp(d) };
    }
    return { success: false, error: 'Application not found' };
  }

  async getPaginated(page = 1, limit = 15, search?: string, filters?: Record<string, string>, sortBy?: string, sortOrder?: string): Promise<ApiResponse<{ data: HostelApplication[]; totalPages: number; total: number }>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    }
    const res = await api.get<any>(`/applications?${params}`);
    const data = extractList(res);
    const total = res.data?.total ?? data.length;
    return { success: true, data: { data, totalPages: Math.ceil(total / limit), total } };
  }

  async createApplication(data: {
    studentId: string; preferredHostelId: string; preferredRoomType?: string; reason?: string;
  }): Promise<ApiResponse<HostelApplication>> {
    try {
      const res = await api.post<any>('/applications', data);
      if (res.success) {
        const d = res.data?.data ?? res.data;
        return { success: true, data: toApp(d) };
      }
    } catch {}
    return { success: false, error: 'Failed to create application' };
  }

  async approveApplication(id: string, reviewedBy: string, reviewRemarks?: string): Promise<ApiResponse<HostelApplication>> {
    const res = await api.post<any>(`/applications/${id}/approve`, { reviewedBy, reviewRemarks });
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toApp(d) };
    }
    return { success: false, error: res.message || 'Failed to approve' };
  }

  async rejectApplication(id: string, reviewedBy: string, reviewRemarks?: string): Promise<ApiResponse<HostelApplication>> {
    const res = await api.post<any>(`/applications/${id}/reject`, { reviewedBy, reviewRemarks });
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toApp(d) };
    }
    return { success: false, error: res.message || 'Failed to reject' };
  }

  async waitlistApplication(id: string, reviewedBy: string, reviewRemarks?: string): Promise<ApiResponse<HostelApplication>> {
    const res = await api.post<any>(`/applications/${id}/waitlist`, { reviewedBy, reviewRemarks });
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toApp(d) };
    }
    return { success: false, error: res.message || 'Failed to waitlist' };
  }

  async cancelApplication(id: string): Promise<ApiResponse<HostelApplication>> {
    const res = await api.post<any>(`/applications/${id}/cancel`);
    if (res.success) {
      const d = res.data?.data ?? res.data;
      return { success: true, data: toApp(d) };
    }
    return { success: false, error: res.message || 'Failed to cancel' };
  }

  async softDelete(id: string): Promise<ApiResponse<HostelApplication>> {
    await api.delete(`/applications/${id}`);
    return { success: true, data: undefined as any };
  }

  async getHistory(applicationId: string): Promise<ApiResponse<any[]>> {
    try {
      const res = await api.get<any>(`/applications/${applicationId}/history`);
      return { success: true, data: res.data?.data ?? [] };
    } catch {
      return { success: true, data: [] };
    }
  }
}

export const applicationService = new ApplicationService();
