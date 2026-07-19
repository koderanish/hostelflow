import { api } from '../api/client';
import type { ApiResponse } from './types';
import type { Complaint } from './complaint.service';

export interface RoomInfo {
  id: string;
  roomNo: string;
  floor: number;
  roomType: string;
  status: string;
  amenities: string[];
  price: number;
  hostelId?: string;
  hostelName?: string;
  buildingId?: string;
  capacity?: number;
  occupied?: number;
  roommate?: {
    id: string;
    name: string;
    avatar?: string;
  };
  facilities?: { icon: string; label: string }[];
}

class RoomService {
  async getByStudentId(studentId: string): Promise<ApiResponse<RoomInfo>> {
    try {
      const response = await api.get(`/rooms/student/${studentId}`);
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Room not found' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch room' };
    }
  }

  async getMaintenanceHistory(roomId: string): Promise<ApiResponse<Complaint[]>> {
    try {
      const response = await api.get(`/complaints?roomId=${roomId}&category=Maintenance`);
      const res = response.data;
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        return { success: true, data };
      }
      return { success: false, error: res.message || 'Failed to fetch maintenance history' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch maintenance history' };
    }
  }
}

export const roomService = new RoomService();
