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

class BuildingService extends BaseService<Building> {
  constructor() {
    super('buildings', INITIAL_BUILDINGS as Building[]);
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
