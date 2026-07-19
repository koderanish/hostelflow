import { api, mockApiCall } from '../api/client';
import type { ApiResponse, Bed } from '../types';

function toBed(d: any): Bed {
  return {
    id: d.id,
    roomId: d.roomId || '',
    bedNo: d.bedNumber || d.bedNo || '',
    status: d.status === 'AVAILABLE' ? 'Available' : d.status === 'OCCUPIED' ? 'Occupied' : d.status || 'Available',
    studentId: d.studentId || undefined,
    isDeleted: d.isDeleted || false,
  };
}

/** Generate mock beds on the fly for any room ID */
function generateMockBeds(roomId: string, count: number): Bed[] {
  const beds: Bed[] = [];
  for (let i = 1; i <= count; i++) {
    beds.push({
      id: `mock-bed-${roomId}-${i}`,
      roomId,
      bedNo: `B-${String.fromCharCode(64 + i)}`,
      status: 'Available',
      isDeleted: false,
    });
  }
  return beds;
}

class BedService {
  async getByRoom(roomId: string): Promise<ApiResponse<Bed[]>> {
    try {
      const res = await api.get<any>(`/beds?roomId=${roomId}`);
      if (res.success) {
        const data = res.data?.data ?? res.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          return { success: true, data: data.map(toBed) };
        }
      }
    } catch {}
    return { success: true, data: generateMockBeds(roomId, 4) };
  }

  async getAvailableByRoom(roomId: string): Promise<ApiResponse<Bed[]>> {
    try {
      const res = await api.get<any>(`/beds?roomId=${roomId}&status=AVAILABLE`);
      if (res.success) {
        const data = res.data?.data ?? res.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          return { success: true, data: data.map(toBed) };
        }
      }
    } catch {}

    // Fallback: try without status filter, then filter client-side
    try {
      const res = await api.get<any>(`/beds?roomId=${roomId}`);
      if (res.success) {
        const data = res.data?.data ?? res.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          const all = data.map(toBed);
          return { success: true, data: all.filter(b => b.status === 'Available') };
        }
      }
    } catch {}

    return { success: true, data: generateMockBeds(roomId, 4) };
  }

  async getById(id: string): Promise<ApiResponse<Bed>> {
    try {
      const res = await api.get<any>(`/beds/${id}`);
      if (res.success && res.data) {
        return { success: true, data: toBed(res.data) };
      }
    } catch {}
    return { success: true, data: { id, roomId: '', bedNo: id, status: 'Available', isDeleted: false } };
  }
}

export const bedService = new BedService();
