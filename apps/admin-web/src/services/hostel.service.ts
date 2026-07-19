import { BaseService } from './base.service';
import { buildingService } from './building.service';
import { mockApiCall } from '../api/client';
import type { Hostel, ApiResponse } from '../types';
import { INITIAL_HOSTELS, INITIAL_STAFF, MOCK_USERS } from '../data';
import { generateId } from '../utils';

interface HostelStats {
  totalHostels: number;
  totalCapacity: number;
  totalOccupied: number;
  occupancyRate: number;
  activeHostels: number;
  maintenanceHostels: number;
  totalBuildings: number;
  totalFloors: number;
  availableBeds: number;
  currentStudents: number;
}

function mapApiHostel(h: any): Hostel {
  if (!h || h.name) return h;
  return {
    ...h,
    name: h.hostelName || h.name || '',
    type: h.hostelType || h.type || 'Boys',
    gender: h.gender || 'Male',
    capacity: h.capacity || 0,
    occupied: h.occupied || 0,
    address: h.address || '',
    wardenId: h.wardenId || '',
    wardenName: h.warden?.fullName || h.wardenName || '',
    status: h.status || 'Active',
    floors: h.floors || 1,
    buildings: h._count?.buildings ?? h.buildings ?? 0,
    facilities: h.facilities || [],
    isDeleted: h.isDeleted || false,
  };
}

function mapApiHostels(data: any): Hostel[] {
  if (!data) return [];
  const arr = Array.isArray(data) ? data : (data.data || data);
  return arr.map(mapApiHostel);
}

class HostelService extends BaseService<Hostel> {
  constructor() {
    super('hostels', INITIAL_HOSTELS as Hostel[], 'hostels');
  }

  async getAll(): Promise<ApiResponse<Hostel[]>> {
    try {
      const res = await (await import('../api/client')).api.get<Hostel[]>(`/${this.resource}`);
      if (res.success && res.data) {
        const data = Array.isArray(res.data) ? res.data : (res.data as any)?.data ?? [];
        return { success: true, data: mapApiHostels(data) };
      }
    } catch {}
    return (await import('../api/client')).mockApiCall(this.getAllFromStorage());
  }

  async getById(id: string): Promise<ApiResponse<Hostel>> {
    try {
      const res = await (await import('../api/client')).api.get<Hostel>(`/${this.resource}/${id}`);
      if (res.success && res.data) {
        const d = (res.data as any)?.data || res.data;
        return { success: true, data: mapApiHostel(d) };
      }
    } catch {}
    const item = this.getAllFromStorage().find(i => i.id === id);
    if (!item) return { success: false, error: 'Not found' };
    return (await import('../api/client')).mockApiCall(item);
  }

  async create(item: Omit<Hostel, 'id'>): Promise<ApiResponse<Hostel>> {
    try {
      const res = await (await import('../api/client')).api.post<Hostel>(`/${this.resource}`, item);
      if (res.success && res.data) {
        return { success: true, data: mapApiHostel(res.data) };
      }
    } catch {}
    const newItem = { id: generateId(), ...item } as Hostel;
    const all = this.getAllFromStorage();
    all.push(newItem);
    this.saveToStorage(all);
    return (await import('../api/client')).mockApiCall(newItem);
  }

  async update(id: string, updates: Partial<Hostel>): Promise<ApiResponse<Hostel>> {
    try {
      const res = await (await import('../api/client')).api.patch<Hostel>(`/${this.resource}/${id}`, updates);
      if (res.success && res.data) {
        return { success: true, data: mapApiHostel(res.data) };
      }
    } catch {}
    const all = this.getAllFromStorage();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return { success: false, error: 'Not found' };
    all[idx] = { ...all[idx], ...updates };
    this.saveToStorage(all);
    return (await import('../api/client')).mockApiCall(all[idx]);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const res = await (await import('../api/client')).api.delete<void>(`/${this.resource}/${id}`);
      if (res.success) return { success: true };
    } catch {}
    const all = this.getAllFromStorage();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return { success: false, error: 'Not found' };
    all.splice(idx, 1);
    this.saveToStorage(all);
    return (await import('../api/client')).mockApiCall(undefined as void);
  }

  async getPaginated(page = 1, limit = 10, search?: string, filters?: Record<string, string>, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<ApiResponse<import('../types').PaginatedResponse<Hostel>>> {
    try {
      const params: Record<string, string | number> = { page, limit };
      if (search) params.search = search;
      if (sortBy) { params.sortBy = sortBy; params.sortOrder = sortOrder || 'asc'; }
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'all') params[k] = v; });
      }
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => sp.set(k, String(v)));
      const res = await (await import('../api/client')).api.get<{ data: Hostel[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/${this.resource}?${sp.toString()}`);
      if (res.success && res.data) {
        const d = res.data as any;
        const items = mapApiHostels(d.data || d || []);
        const pagination = d.pagination || { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit) };
        return { success: true, data: { data: items, total: pagination.total, page: pagination.page, limit: pagination.limit, totalPages: pagination.totalPages } };
      }
    } catch {}
    return (await import('../api/client')).mockPaginatedApiCall(this.getAllFromStorage(), page, limit, search, filters, sortBy, sortOrder);
  }

  async getStatistics(): Promise<ApiResponse<HostelStats>> {
    const hostels = this.getAllFromStorage().filter(h => !h.isDeleted);
    const totalHostels = hostels.length;
    const totalCapacity = hostels.reduce((s, h) => s + h.capacity, 0);
    const totalOccupied = hostels.reduce((s, h) => s + h.occupied, 0);
    const activeHostels = hostels.filter(h => h.status === 'Active').length;
    const maintenanceHostels = hostels.filter(h => h.status === 'Maintenance').length;

    const buildingsRes = await buildingService.getAll();
    const allBuildings = buildingsRes.data?.filter(b => !b.isDeleted) || [];
    const activeHostelIds = new Set(hostels.map(h => h.id));
    const activeBuildings = allBuildings.filter(b => activeHostelIds.has(b.hostelId));
    const totalBuildings = activeBuildings.length;
    const totalFloors = activeBuildings.reduce((s, b) => s + b.floors, 0);

    const availableBeds = totalCapacity - totalOccupied;

    return mockApiCall({
      totalHostels,
      totalCapacity,
      totalOccupied,
      occupancyRate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
      activeHostels,
      maintenanceHostels,
      totalBuildings,
      totalFloors,
      availableBeds,
      currentStudents: totalOccupied,
    });
  }

  async softDelete(id: string): Promise<ApiResponse<Hostel>> {
    return this.update(id, { isDeleted: true, status: 'Maintenance' } as Partial<Hostel>);
  }

  async checkNameExists(name: string, excludeId?: string): Promise<ApiResponse<boolean>> {
    const hostels = this.getAllFromStorage().filter(h => !h.isDeleted);
    const exists = hostels.some(h => h.name.toLowerCase() === name.toLowerCase() && h.id !== excludeId);
    return mockApiCall(exists);
  }

  async hasActiveRooms(id: string): Promise<ApiResponse<boolean>> {
    const { roomService } = await import('./room.service');
    const roomsRes = await roomService.getByField('hostelId', id);
    if (!roomsRes.success || !roomsRes.data) return mockApiCall(false);
    const hasActive = roomsRes.data.some(r => r.status === 'Occupied');
    return mockApiCall(hasActive);
  }

  async getWardens() {
    const staffWardens = INITIAL_STAFF.filter(s => s.role === 'Warden' || s.department === 'Hostel Management');
    const userWardens = MOCK_USERS.filter(u => u.role === 'warden').map(u => ({
      id: u.id, name: u.name, role: 'Warden', phone: u.phone, email: u.email,
      department: 'Hostel Management', joinDate: '', status: 'Active' as const,
    }));
    return mockApiCall([...staffWardens, ...userWardens]);
  }

  async createHostel(data: Omit<Hostel, 'id' | 'occupied' | 'isDeleted' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Hostel>> {
    const now = new Date().toISOString();
    const newHostel = {
      ...data,
      occupied: 0,
      id: generateId(),
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    } as Hostel;
    const all = this.getAllFromStorage();
    all.push(newHostel);
    this.saveToStorage(all);
    return mockApiCall(newHostel);
  }

  async updateHostel(id: string, data: Partial<Omit<Hostel, 'id'>>): Promise<ApiResponse<Hostel>> {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(h => h.id === id);
    if (idx === -1) return { success: false, error: 'Hostel not found' };
    const { occupied, ...safeData } = data as Hostel;
    all[idx] = { ...all[idx], ...safeData, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return mockApiCall(all[idx]);
  }

  async syncOccupancy(hostelId: string): Promise<ApiResponse<Hostel>> {
    const { roomService } = await import('./room.service');
    const { bedService } = await import('./bed.service');
    const roomsRes = await roomService.getByHostel(hostelId);
    const rooms = roomsRes.data?.filter(r => !r.isDeleted) || [];
    let totalCapacity = 0;
    let totalOccupied = 0;
    for (const room of rooms) {
      const stats = bedService.computeRoomStats(room.id);
      totalCapacity += stats.capacity;
      totalOccupied += stats.occupiedBeds;
    }
    return this.updateHostel(hostelId, { capacity: totalCapacity, occupied: totalOccupied } as Hostel);
  }

  async deleteHostel(id: string): Promise<ApiResponse<void>> {
    const activeRoomsRes = await this.hasActiveRooms(id);
    if (activeRoomsRes.success && activeRoomsRes.data) {
      return { success: false, error: 'Cannot delete hostel with active rooms. Please vacate all rooms first.' };
    }
    return this.delete(id);
  }
}

export const hostelService = new HostelService();
