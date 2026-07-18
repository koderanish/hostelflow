import { Notification } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data';
import { mockApiCall } from '../api/client';

class NotificationService {
  private notifications: Notification[] = INITIAL_NOTIFICATIONS as Notification[];

  async getAll(userId: string): Promise<{ success: boolean; data?: Notification[] }> {
    return mockApiCall(this.notifications.filter(n => n.userId === userId));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  async markRead(id: string): Promise<{ success: boolean }> {
    const idx = this.notifications.findIndex(n => n.id === id);
    if (idx !== -1) this.notifications[idx].read = true;
    return { success: true };
  }

  async markAllRead(userId: string): Promise<{ success: boolean }> {
    this.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    return { success: true };
  }

  async add(notification: Omit<Notification, 'id'>): Promise<{ success: boolean; data?: Notification }> {
    const n: Notification = { ...notification, id: Math.random().toString(36).substring(2, 10) };
    this.notifications.unshift(n);
    return { success: true, data: n };
  }
}

export const notificationService = new NotificationService();
