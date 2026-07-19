import { BaseService } from './base.service';
import { mockApiCall } from '../api/client';
import type { Building, ApiResponse, Hostel, Staff } from '../types';
import { INITIAL_BUILDINGS, INITIAL_HOSTELS, INITIAL_STAFF, MOCK_USERS } from '../data';
import { generateId } from '../utils';

interface BuildingStats {
  totalBuildings: number;
  totalFloors: number;
  totalCapacity: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceBuildings: number;
  occupancyRate: number;
  students: number;
}

function mapApiBuilding(b: any): Building {
  if (!b || b.name !== undefined) return b;
  return {
    id: b.id,
    hostelId: b.hostelId || '',
    name: b.name || '',
    code: b.code || '',
    description: b.description || '',
    gender: b.gender || 'Male',
    floors: b.floors || 1,
    capacity: b.capacity || 0,
    occupiedRooms: b.occupiedRooms ?? 0,
    availableRooms: b.availableRooms ?? 0,
    status: b.status || 'Active',
    wardenId: b.wardenId || '',
    isDeleted: b.isDeleted || false,
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: b.updatedAt || new Date().toISOString(),
  };
}

function mapApiBuildings(data: any): Building[] {
  if (!data) return [];
  const arr = Array.isArray(data) ? data : (data.data || data);
  return arr.map(mapApiBuilding);
}

class BuildingService extends BaseService<Building> {
  constructor() {
    super('buildings', INITIAL_BUILDINGS as Building[]);
  }

  async getAll(): Promise<ApiResponse<Building[]>> {
    try {
      const res = await (await import('../api/client')).api.get<Building[]>(`/${this.resource}`);
      if (res.success && res.data) {
        const data = Array.isArray(res.data) ? res.data : (res.data as any)?.data ?? [];
        return { success: true, data: mapApiBuildings(data) };
      }
    } catch {}
    return (await import('../api/client')).mockApiCall(this.getAllFromStorage());
  }

  async getById(id: string): Promise<ApiResponse<Building>> {
    try {
      const res = await (await import('../api/client')).api.get<Building>(`/${this.resource}/${id}`);
      if (res.success && res.data) {
        const d = (res.data as any)?.data || res.data;
        return { success: true, data: mapApiBuilding(d) };
      }
    } catch {}
    const item = this.getAllFromStorage().find(i => i.id === id);
    if (!item) return { success: false, error: 'Not found' };
    return (await import('../api/client')).mockApiCall(item);
  }

  async create(item: Omit<Building, 'id'>): Promise<ApiResponse<Building>> {
    try {
      const res = await (await import('../api/client')).api.post<Building>(`/${this.resource}`, item);
      if (res.success && res.data) {
        return { success: true, data: mapApiBuilding(res.data) };
      }
    } catch {}
    const newItem = { id: generateId(), ...item } as unknown as Building;
    const all = this.getAllFromStorage();
    all.push(newItem);
    this.saveToStorage(all);
    return (await import('../api/client')).mockApiCall(newItem);
  }

  async update(id: string, updates: Partial<Building>): Promise<ApiResponse<Building>> {
    try {
      const res = await (await import('../api/client')).api.patch<Building>(`/${this.resource}/${id}`, updates);
      if (res.success && res.data) {
        return { success: true, data: mapApiBuilding(res.data) };
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

  async getPaginated(page = 1, limit = 10, search?: string, filters?: Record<string, string>, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<import('../types').ApiResponse<import('../types').PaginatedResponse<Building>>> {
    try {
      const params: Record<string, string | number> = { page, limit };
      if (search) params.search = search;
      if (sortBy) { params.sortBy = sortBy; params.sortOrder = sortOrder || 'asc'; }
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'all') params[k] = v; });
      }
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => sp.set(k, String(v)));
      const res = await (await import('../api/client')).api.get<{ data: Building[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/${this.resource}?${sp.toString()}`);
      if (res.success && res.data) {
        const d = res.data as any;
        const items = mapApiBuildings(d.data || d || []);
        const pagination = d.pagination || { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit) };
        return { success: true, data: { data: items, total: pagination.total, page: pagination.page, limit: pagination.limit, totalPages: pagination.totalPages } };
      }
    } catch {}
    return (await import('../api/client')).mockPaginatedApiCall(this.getAllFromStorage(), page, limit, search, filters, sortBy, sortOrder);
  }

  async getStatistics(): Promise<ApiResponse<BuildingStats>> {
    const buildings = this.getAllFromStorage().filter(b => !b.isDeleted);
    const totalBuildings = buildings.length;
    const totalFloors = buildings.reduce((s, b) => s + b.floors, 0);
    const totalCapacity = buildings.reduce((s, b) => s + b.capacity, 0);
    const occupiedRooms = buildings.reduce((s, b) => s + b.occupiedRooms, 0);
    const availableRooms = buildings.reduce((s, b) => s + b.availableRooms, 0);
    const maintenanceBuildings = buildings.filter(b => b.status === 'Maintenance').length;
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedRooms / totalCapacity) * 100) : 0;

    return mockApiCall({
      totalBuildings, totalFloors, totalCapacity, occupiedRooms,
      availableRooms, maintenanceBuildings, occupancyRate,
      students: occupiedRooms,
    });
  }

  async getHostels(): Promise<ApiResponse<Hostel[]>> {
    return mockApiCall(INITIAL_HOSTELS.filter(h => !h.isDeleted));
  }

  async getWardens(): Promise<ApiResponse<Staff[]>> {
    const staffWardens = INITIAL_STAFF.filter(s => s.role === 'Warden' || s.department === 'Hostel Management');
    const userWardens = MOCK_USERS.filter(u => u.role === 'warden').map(u => ({
      id: u.id, name: u.name, role: 'Warden', phone: u.phone, email: u.email,
      department: 'Hostel Management' as const, joinDate: '', status: 'Active' as const,
    }));
    return mockApiCall([...staffWardens, ...userWardens]);
  }

  async getBuildingRooms(buildingId: string) {
    const { roomService } = await import('./room.service');
    const res = await roomService.getAll();
    const all = res.data || [];
    return mockApiCall(all.filter(r => r.buildingId === buildingId));
  }

  async checkCodeExists(code: string, hostelId: string, excludeId?: string): Promise<ApiResponse<boolean>> {
    const buildings = this.getAllFromStorage().filter(b => !b.isDeleted);
    const exists = buildings.some(b =>
      b.code.toLowerCase() === code.toLowerCase() &&
      b.hostelId === hostelId &&
      b.id !== excludeId
    );
    return mockApiCall(exists);
  }

  async hasActiveRooms(buildingId: string): Promise<ApiResponse<boolean>> {
    const roomsRes = await this.getBuildingRooms(buildingId);
    if (!roomsRes.success || !roomsRes.data) return mockApiCall(false);
    const hasActive = roomsRes.data.some(r => r.status === 'Occupied');
    return mockApiCall(hasActive);
  }

  async createBuilding(data: Omit<Building, 'id' | 'occupiedRooms' | 'availableRooms' | 'isDeleted' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Building>> {
    const now = new Date().toISOString();
    const newItem = {
      ...data,
      occupiedRooms: 0,
      availableRooms: 0,
      id: generateId(),
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    } as unknown as Building;
    const all = this.getAllFromStorage();
    all.push(newItem);
    this.saveToStorage(all);
    return mockApiCall(newItem);
  }

  async updateBuilding(id: string, data: Partial<Omit<Building, 'id'>>): Promise<ApiResponse<Building>> {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(b => b.id === id);
    if (idx === -1) return { success: false, error: 'Building not found' };
    const { occupiedRooms, availableRooms, ...safeData } = data as Building;
    all[idx] = { ...all[idx], ...safeData, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return mockApiCall(all[idx]);
  }

  async deleteBuilding(id: string): Promise<ApiResponse<void>> {
    const activeRes = await this.hasActiveRooms(id);
    if (activeRes.success && activeRes.data) {
      return { success: false, error: 'Cannot delete building with active rooms. Please vacate all rooms first.' };
    }
    const all = this.getAllFromStorage();
    const idx = all.findIndex(b => b.id === id);
    if (idx === -1) return { success: false, error: 'Building not found' };
    all.splice(idx, 1);
    this.saveToStorage(all);
    return mockApiCall(undefined as unknown as void);
  }

  async softDelete(id: string): Promise<ApiResponse<Building>> {
    return this.updateBuilding(id, { isDeleted: true, status: 'Maintenance' });
  }

  async syncOccupancy(buildingId: string): Promise<ApiResponse<Building>> {
    const { roomService } = await import('./room.service');
    const roomsRes = await roomService.getByBuilding(buildingId);
    const rooms = roomsRes.data?.filter(r => !r.isDeleted) || [];
    const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'Available' || r.status === 'Reserved').length;
    const capacity = rooms.length;
    return this.updateBuilding(buildingId, { occupiedRooms, availableRooms, capacity } as Building);
  }

  async getHostelName(hostelId: string): Promise<string> {
    const hostel = INITIAL_HOSTELS.find(h => h.id === hostelId);
    return hostel?.name || 'Unknown Hostel';
  }
}

export const buildingService = new BuildingService();
