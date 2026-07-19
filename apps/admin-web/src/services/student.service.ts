import { api } from '../api/client';
import type { ApiResponse, PaginatedResponse, Student } from '../types';

function extractYear(y: string | number | undefined | null): number | null {
  if (!y) return null;
  if (typeof y === 'number') return y;
  const m = String(y).match(/\d+/);
  return m ? parseInt(m[0]) : null;
}

function toStudent(d: any): Student {
  const ey = extractYear(d.year);
  const ySuffix = ey ? (['th', 'st', 'nd', 'rd'][ey % 10 > 3 ? 0 : ey % 10] || 'th') : '';
  return {
    id: d.id,
    userId: d.userId || d.user?.id || '',
    name: d.fullName || d.user?.fullName || d.name || '',
    email: d.user?.email || d.email || '',
    phone: d.user?.phone || d.phone || '',
    gender: d.gender || 'Male',
    dob: d.dob ? new Date(d.dob).toISOString().split('T')[0] : '',
    bloodGroup: d.bloodGroup || '',
    address: d.address || '',
    enrollmentNo: d.enrollmentNo || '',
    registrationNo: d.registrationNo || '',
    department: d.department || '',
    course: d.course || '',
    year: ey ? `${ey}${ySuffix} Year` : '',
    semester: d.semester || '',
    parentName: d.guardianName || d.parentName || '',
    parentContact: d.guardianPhone || d.parentContact || '',
    emergencyContactName: d.emergencyContactName || '',
    emergencyContactPhone: d.emergencyContactPhone || '',
    emergencyContactRelation: d.emergencyContactRelation || '',
    hostelId: d.hostelId || '',
    roomId: d.roomId || '',
    roomNo: d.roomNo || '',
    status: d.status || (d.user?.status === false ? 'Inactive' : 'Active'),
    feeStatus: d.feeStatus || 'PENDING',
    admissionDate: d.admissionDate ? new Date(d.admissionDate).toISOString().split('T')[0] : (d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : ''),
    createdAt: d.createdAt || '',
    updatedAt: d.updatedAt || '',
    isDeleted: d.isDeleted || false,
  };
}

function toBackend(item: any): any {
  return {
    name: item.name,
    email: item.email,
    phone: item.phone,
    registrationNo: item.registrationNo,
    enrollmentNo: item.enrollmentNo,
    course: item.course,
    department: item.department,
    year: item.year,
    semester: item.semester,
    gender: item.gender,
    dob: item.dob,
    parentName: item.parentName,
    parentContact: item.parentContact,
    emergencyContactName: item.emergencyContactName,
    emergencyContactPhone: item.emergencyContactPhone,
    emergencyContactRelation: item.emergencyContactRelation,
    address: item.address,
    bloodGroup: item.bloodGroup,
    status: item.status,
    feeStatus: item.feeStatus,
    admissionDate: item.admissionDate,
  };
}

class StudentService {
  async getAll(): Promise<ApiResponse<Student[]>> {
    const res = await api.get<any>(`/students`);
    if (!res.success) return { success: false, error: res.error || 'Failed to fetch students' };
    const data = res.data?.data ?? res.data ?? [];
    return { success: true, data: (Array.isArray(data) ? data : []).map((d: any) => toStudent(d)) };
  }

  async getById(id: string): Promise<ApiResponse<Student>> {
    const res = await api.get<any>(`/students/${id}`);
    if (!res.success) return { success: false, error: res.error || 'Not found' };
    return { success: true, data: toStudent(res.data) };
  }

  async getPaginated(
    page = 1, limit = 10, search?: string,
    filters?: Record<string, string>, sortBy?: string, sortOrder?: 'asc' | 'desc'
  ): Promise<ApiResponse<PaginatedResponse<Student>>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    if (sortBy) { params.sortBy = sortBy; params.sortOrder = sortOrder || 'asc'; }
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== 'all') params[k] = v;
      });
    }
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => sp.set(k, String(v)));
    const res = await api.get<any>(`/students?${sp.toString()}`);
    if (!res.success) return { success: false, error: res.error || 'Failed to fetch students' };
    const d = res.data;
    const items = d?.data ?? d ?? [];
    const pagination = d?.pagination || { total: items.length, page, limit, totalPages: Math.ceil((items.length || 1) / limit) };
    return {
      success: true,
      data: {
        data: (Array.isArray(items) ? items : []).map((i: any) => toStudent(i)),
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      },
    };
  }

  async getByHostel(hostelId: string): Promise<ApiResponse<Student[]>> {
    const all = await this.getAll();
    if (!all.success) return all;
    return { success: true, data: (all.data || []).filter(s => s.hostelId === hostelId) };
  }

  async getUnallocated(): Promise<ApiResponse<Student[]>> {
    const all = await this.getAll();
    if (!all.success) return all;
    return { success: true, data: (all.data || []).filter(s => !s.hostelId || !s.roomId) };
  }

  async getByUserId(userId: string): Promise<ApiResponse<Student | undefined>> {
    const res = await this.getAll();
    if (!res.success) return { success: false, error: res.error };
    return { success: true, data: (res.data || []).find(s => s.userId === userId) };
  }

  async checkEnrollmentUnique(enrollmentNo: string, _excludeId?: string): Promise<ApiResponse<boolean>> {
    const res = await this.getAll();
    if (!res.success) return { success: true, data: false };
    return { success: true, data: (res.data || []).some(s => s.enrollmentNo === enrollmentNo && s.id !== _excludeId) };
  }

  async checkEmailUnique(email: string, _excludeId?: string): Promise<ApiResponse<boolean>> {
    const res = await this.getAll();
    if (!res.success) return { success: true, data: false };
    return { success: true, data: (res.data || []).some(s => s.email === email && s.id !== _excludeId) };
  }

  async createStudent(data: Omit<Student, 'id' | 'isDeleted' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Student>> {
    const res = await api.post<any>(`/students`, toBackend(data));
    if (!res.success) return { success: false, error: res.error || 'Failed to create student' };
    return { success: true, data: toStudent(res.data) };
  }

  async updateStudent(id: string, data: Partial<Omit<Student, 'id' | 'isDeleted'>>): Promise<ApiResponse<Student>> {
    const res = await api.patch<any>(`/students/${id}`, toBackend(data));
    if (!res.success) return { success: false, error: res.error || 'Failed to update student' };
    return { success: true, data: toStudent(res.data) };
  }

  async softDelete(id: string): Promise<ApiResponse<Student>> {
    const res = await api.delete<any>(`/students/${id}`);
    if (!res.success) return { success: false, error: res.error || 'Failed to delete student' };
    return { success: true, data: res.data };
  }

  async restore(id: string): Promise<ApiResponse<Student>> {
    const res = await api.patch<any>(`/students/${id}`, { isDeleted: false });
    if (!res.success) return { success: false, error: res.error || 'Failed to restore student' };
    return { success: true, data: toStudent(res.data) };
  }

  async resetPassword(id: string): Promise<ApiResponse<{ loginId: string; name: string; generatedPassword: string }>> {
    const res = await api.patch<any>(`/students/${id}/reset-password`);
    if (!res.success) return { success: false, error: res.error || 'Failed to reset password' };
    return { success: true, data: res.data };
  }

  async getHistory(_studentId: string): Promise<ApiResponse<any[]>> {
    return { success: true, data: [] };
  }
}

export const studentService = new StudentService();
