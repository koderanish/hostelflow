import { api } from '../api/client';
import type { ApiResponse, PaginatedResponse, RoomAllocation } from '../types';

const STATUS_MAP: Record<string, RoomAllocation['status']> = {
  ACTIVE: 'Active',
  TRANSFERRED: 'Transferred',
  VACATED: 'Vacated',
  CANCELLED: 'Cancelled',
};

function toAllocation(d: any): RoomAllocation {
  return {
    id: d.id,
    studentId: d.studentId || '',
    studentName: d.student?.user?.fullName || d.studentName || '',
    hostelId: d.room?.hostelId || d.hostelId || '',
    hostelName: d.room?.hostel?.hostelName || d.hostelName || '',
    roomId: d.roomId || '',
    roomNo: d.room?.roomNumber || d.roomNo || '',
    bedId: d.bedId || '',
    bedNo: d.bed?.bedNumber || d.bedNo || '',
    buildingId: d.room?.buildingId || d.buildingId || '',
    applicationId: d.applicationId || '',
    dateAllocated: d.allocatedDate
      ? (typeof d.allocatedDate === 'string' ? d.allocatedDate.split('T')[0] : new Date(d.allocatedDate).toISOString().split('T')[0])
      : '',
    expectedVacateDate: d.expectedVacateDate
      ? (typeof d.expectedVacateDate === 'string' ? d.expectedVacateDate.split('T')[0] : new Date(d.expectedVacateDate).toISOString().split('T')[0])
      : '',
    dateVacated: d.checkOut
      ? (typeof d.checkOut === 'string' ? d.checkOut.split('T')[0] : new Date(d.checkOut).toISOString().split('T')[0])
      : '',
    status: STATUS_MAP[d.status] || d.status || 'Active',
    transferHistory: d.transferHistory || [],
    isDeleted: false,
    createdAt: d.createdAt ? (typeof d.createdAt === 'string' ? d.createdAt : new Date(d.createdAt).toISOString()) : '',
    updatedAt: d.updatedAt ? (typeof d.updatedAt === 'string' ? d.updatedAt : new Date(d.updatedAt).toISOString()) : '',
  };
}

function extractPagination(d: any, page: number, limit: number) {
  const items = d?.data?.data ?? d?.data ?? d ?? [];
  const pagination = d?.data?.pagination ?? d?.pagination ?? { total: 0, page, limit, totalPages: 0 };
  return { items: Array.isArray(items) ? items : [], pagination };
}

class AllocationService {
  async getAll(): Promise<ApiResponse<RoomAllocation[]>> {
    const res = await api.get<any>(`/allocations`);
    if (!res.success) return { success: false, error: res.error || 'Failed to fetch allocations' };
    const data = res.data?.data ?? res.data ?? [];
    return { success: true, data: (Array.isArray(data) ? data : []).map(toAllocation) };
  }

  async getById(id: string): Promise<ApiResponse<RoomAllocation>> {
    const res = await api.get<any>(`/allocations/${id}`);
    if (!res.success) return { success: false, error: res.error || 'Not found' };
    return { success: true, data: toAllocation(res.data) };
  }

  async getPaginated(
    page = 1, limit = 10, search?: string,
    filters?: Record<string, string>, sortBy?: string, sortOrder?: 'asc' | 'desc'
  ): Promise<ApiResponse<PaginatedResponse<RoomAllocation>>> {
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
    const res = await api.get<any>(`/allocations?${sp.toString()}`);
    if (!res.success) return { success: false, error: res.error || 'Failed to fetch allocations' };
    const { items, pagination } = extractPagination(res, page, limit);
    return {
      success: true,
      data: {
        data: items.map(toAllocation),
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      },
    };
  }

  async getActive(): Promise<ApiResponse<RoomAllocation[]>> {
    const res = await this.getAll();
    if (!res.success) return res;
    return { success: true, data: (res.data || []).filter(a => a.status === 'Active') };
  }

  async getByStudent(studentId: string): Promise<ApiResponse<RoomAllocation[]>> {
    const res = await api.get<any>(`/allocations?studentId=${studentId}`);
    if (!res.success) return { success: false, error: res.error };
    const { items } = extractPagination(res, 1, 100);
    return { success: true, data: items.map(toAllocation) };
  }

  async getByHostel(hostelId: string): Promise<ApiResponse<RoomAllocation[]>> {
    const all = await this.getAll();
    if (!all.success) return all;
    return { success: true, data: (all.data || []).filter(a => a.hostelId === hostelId) };
  }

  async getByRoom(roomId: string): Promise<ApiResponse<RoomAllocation[]>> {
    const res = await api.get<any>(`/allocations?roomId=${roomId}`);
    if (!res.success) return { success: false, error: res.error };
    const { items } = extractPagination(res, 1, 100);
    return { success: true, data: items.map(toAllocation) };
  }

  async createAllocation(data: {
    studentId: string; studentName: string;
    applicationId?: string;
    hostelId: string; hostelName: string;
    buildingId?: string;
    roomId: string; roomNo: string;
    bedId: string; bedNo?: string;
    dateAllocated: string;
    expectedVacateDate?: string;
  }) {
    const res = await api.post<any>(`/allocations`, {
      studentId: data.studentId,
      roomId: data.roomId,
      bedId: data.bedId || undefined,
      applicationId: data.applicationId || undefined,
      allocatedDate: data.dateAllocated || new Date().toISOString().split('T')[0],
      expectedVacateDate: data.expectedVacateDate || undefined,
    });
    if (!res.success) return { success: false, error: res.error || 'Failed to create allocation' };
    return { success: true, data: toAllocation(res.data) };
  }

  async transferAllocation(id: string, data: {
    roomId: string; roomNo: string; bedId: string; bedNo?: string;
    hostelId: string; hostelName: string; buildingId?: string;
  }) {
    const res = await api.post<any>(`/allocations/${id}/transfer`, {
      roomId: data.roomId,
      bedId: data.bedId || undefined,
    });
    if (!res.success) return { success: false, error: res.error || 'Failed to transfer allocation' };
    return { success: true, data: { newAllocation: toAllocation(res.data) } };
  }

  async vacateAllocation(id: string) {
    const res = await api.post<any>(`/allocations/${id}/vacate`);
    if (!res.success) return { success: false, error: res.error || 'Failed to vacate allocation' };
    return { success: true, data: toAllocation(res.data) };
  }

  async cancelAllocation(id: string) {
    const res = await api.patch<any>(`/allocations/${id}`, { status: 'CANCELLED' });
    if (!res.success) return { success: false, error: res.error || 'Failed to cancel allocation' };
    return { success: true, data: toAllocation(res.data) };
  }

  async softDelete(id: string) {
    const res = await api.delete<any>(`/allocations/${id}`);
    if (!res.success) return { success: false, error: res.error || 'Failed to delete allocation' };
    return { success: true, data: res.data };
  }

  async restore(id: string) {
    const res = await api.patch<any>(`/allocations/${id}`, { isDeleted: false });
    if (!res.success) return { success: false, error: res.error || 'Failed to restore allocation' };
    return { success: true, data: toAllocation(res.data) };
  }

  async getHistory(_allocationId: string): Promise<ApiResponse<any[]>> {
    return { success: true, data: [] };
  }
}

export const allocationService = new AllocationService();
