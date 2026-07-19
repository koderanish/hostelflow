import { api } from '../api/client';
import type { ApiResponse } from './types';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  date: string;
  link?: string;
}

class NotificationService {
  async getByStudent(studentId: string): Promise<ApiResponse<Notification[]>> {
    try {
      const response = await api.get(`/notifications?studentId=${studentId}`);
      const res = response.data;
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        return { success: true, data };
      }
      return { success: false, error: res.message || 'Failed to fetch notifications' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch notifications' };
    }
  }

  async markRead(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      const res = response.data;
      if (res.success) return { success: true };
      return { success: false, error: res.message || 'Failed to mark notification as read' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to mark notification as read' };
    }
  }
}

export const notificationService = new NotificationService();
