import { api } from '../api/client';
import type { ApiResponse, Bed } from '../types';
import { generateId } from '../utils';

let cachedBeds: Bed[] = [];

function toBed(d: any): Bed {
  return {
    id: d.id,
    roomId: d.roomId || '',
    bedNo: d.bedNumber || d.bedNo || '',
    status: d.status === 'AVAILABLE' ? 'Available' : d.status === 'OCCUPIED' ? 'Occupied' : d.status || 'Available',
    studentId: d.studentId || undefined,
  };
}

function extractList(res: any): Bed[] {
  if (!res.success) return [];
  const raw = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
  return Array.isArray(raw) ? raw.map(toBed) : [];
}

function saveToLocal(): void {
  try {
    localStorage.setItem('hostelflow_beds', JSON.stringify(cachedBeds));
  } catch {}
}

function loadFromLocal(): void {
  try {
    const raw = localStorage.getItem('hostelflow_beds');
    if (raw) cachedBeds = JSON.parse(raw);
  } catch {}
}

loadFromLocal();

class BedService {
  async getAll(): Promise<ApiResponse<Bed[]>> {
    try {
      const res = await api.get<any>('/beds?limit=1000');
      cachedBeds = extractList(res);
      saveToLocal();
      return { success: true, data: cachedBeds };
    } catch {
      return { success: true, data: cachedBeds };
    }
  }

  computeRoomStats(roomId: string) {
    const all = cachedBeds;
    const beds = all.filter(b => b.roomId === roomId);
    const total = beds.length;
    const occupied = beds.filter(b => b.status === 'Occupied' || !!b.studentId).length;
    const capacity = total;
    const occupiedBeds = occupied;
    const status = occupied === total ? 'Occupied' : occupied === 0 ? 'Available' : 'Partially Occupied';
    return { total, occupied, available: total - occupied, capacity, occupiedBeds, status };
  }

  /** Get ALL beds for a room (any status) */
  async getByRoom(roomId: string): Promise<ApiResponse<Bed[]>> {
    if (!roomId) return { success: true, data: [] };
    try {
      const res = await api.get<any>(`/beds?roomId=${roomId}`);
      const beds = extractList(res);
      // Update local cache with API data
      const other = cachedBeds.filter(b => b.roomId !== roomId);
      cachedBeds = [...other, ...beds];
      saveToLocal();
      return { success: true, data: beds };
    } catch {
      return { success: true, data: cachedBeds.filter(b => b.roomId === roomId) };
    }
  }

  /** Get only AVAILABLE beds for a room */
  async getAvailableByRoom(roomId: string): Promise<ApiResponse<Bed[]>> {
    if (!roomId) return { success: true, data: [] };
    try {
      const res = await api.get<any>(`/beds?roomId=${roomId}&status=AVAILABLE`);
      const beds = extractList(res);
      if (beds.length > 0) return { success: true, data: beds };
    } catch {}

    try {
      const res = await api.get<any>(`/beds?roomId=${roomId}`);
      const all = extractList(res);
      return { success: true, data: all.filter(b => b.status === 'Available') };
    } catch {
      return { success: true, data: cachedBeds.filter(b => b.roomId === roomId && b.status === 'Available') };
    }
  }

  /** Generate beds for a room via API, fall back to local generation */
  async bulkGenerate(roomId: string, count: number, prefix?: string): Promise<ApiResponse<Bed[]>> {
    try {
      const res = await api.post<any>(`/beds/bulk`, { roomId, count, prefix });
      if (res.success) {
        const beds = extractList(res);
        const other = cachedBeds.filter(b => b.roomId !== roomId);
        cachedBeds = [...other, ...beds];
        saveToLocal();
        return { success: true, data: beds };
      }
    } catch {}
    // Fallback: generate beds locally
    const existing = cachedBeds.filter(b => b.roomId === roomId).length;
    const newBeds: Bed[] = [];
    for (let i = 1; i <= count; i++) {
      const bedNumber = prefix ? `${prefix}-${existing + i}` : `B${String.fromCharCode(64 + existing + i)}`;
      newBeds.push({
        id: generateId(),
        roomId,
        bedNo: bedNumber,
        status: 'Available',
      });
    }
    cachedBeds = [...cachedBeds, ...newBeds];
    saveToLocal();
    return { success: true, data: cachedBeds.filter(b => b.roomId === roomId) };
  }

  async getById(id: string): Promise<ApiResponse<Bed>> {
    try {
      const res = await api.get<any>(`/beds/${id}`);
      if (res.success) {
        const d = res.data?.data ?? res.data;
        return { success: true, data: toBed(d) };
      }
    } catch {
      const local = cachedBeds.find(b => b.id === id);
      if (local) return { success: true, data: local };
    }
    return { success: false, error: 'Bed not found' };
  }

  async vacate(bedId: string, performedBy?: string): Promise<ApiResponse<Bed>> {
    try {
      const res = await api.patch<any>(`/beds/${bedId}`, { status: 'AVAILABLE', studentId: null });
      if (res.success) {
        const d = res.data?.data ?? res.data;
        const bed = toBed(d);
        const idx = cachedBeds.findIndex(b => b.id === bedId);
        if (idx !== -1) cachedBeds[idx] = bed;
        saveToLocal();
        return { success: true, data: bed };
      }
    } catch {}
    const idx = cachedBeds.findIndex(b => b.id === bedId);
    if (idx !== -1) {
      cachedBeds[idx] = { ...cachedBeds[idx], status: 'Available', studentId: undefined };
      saveToLocal();
      return { success: true, data: cachedBeds[idx] };
    }
    return { success: false, error: 'Failed to vacate bed' };
  }

  async allocate(studentId: string, bedId: string, performedBy?: string): Promise<ApiResponse<Bed>> {
    try {
      const res = await api.patch<any>(`/beds/${bedId}`, { status: 'OCCUPIED', studentId });
      if (res.success) {
        const d = res.data?.data ?? res.data;
        const bed = toBed(d);
        const idx = cachedBeds.findIndex(b => b.id === bedId);
        if (idx !== -1) cachedBeds[idx] = bed;
        saveToLocal();
        return { success: true, data: bed };
      }
    } catch {}
    const idx = cachedBeds.findIndex(b => b.id === bedId);
    if (idx !== -1) {
      cachedBeds[idx] = { ...cachedBeds[idx], status: 'Occupied', studentId };
      saveToLocal();
      return { success: true, data: cachedBeds[idx] };
    }
    return { success: false, error: 'Failed to allocate bed' };
  }
}

export const bedService = new BedService();
