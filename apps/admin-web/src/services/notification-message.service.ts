import { BaseService } from './base.service';
import type { NotificationMessage, NotificationTemplate } from '../types';
import { INITIAL_NOTIFICATION_MESSAGES, INITIAL_NOTIFICATION_TEMPLATES } from '../data';
import { generateId } from '../utils';

interface NotificationEvent {
  id: string; notificationId: string; eventType: string;
  timestamp: string; performedBy?: string;
  previousStatus?: string; newStatus?: string; details?: string;
}

class NotificationEventService extends BaseService<NotificationEvent> {
  constructor() { super('notification-events', []); }

  async log(notificationId: string, eventType: string, performedBy?: string, previousStatus?: string, newStatus?: string, details?: string) {
    const evt: NotificationEvent = {
      id: generateId(), notificationId, eventType,
      timestamp: new Date().toISOString(), performedBy, previousStatus, newStatus, details,
    };
    const all = this.getAllFromStorage();
    all.push(evt);
    this.saveToStorage(all);
  }

  async getByNotification(notificationId: string) {
    return this.getByField('notificationId', notificationId);
  }
}

class NotificationMessageService extends BaseService<NotificationMessage> {
  private eventService: NotificationEventService;

  constructor() {
    super('notificationMessages', INITIAL_NOTIFICATION_MESSAGES as NotificationMessage[]);
    this.eventService = new NotificationEventService();
  }

  async create(data: {
    title: string; message: string; type: NotificationMessage['type'];
    target: NotificationMessage['target']; deliveryChannel: NotificationMessage['deliveryChannel'];
    recipientId?: string; scheduledTime?: string;
  }) {
    // Scheduled time cannot be in the past
    if (data.scheduledTime && new Date(data.scheduledTime) < new Date()) {
      return { success: false, error: 'Scheduled time cannot be in the past' };
    }

    const now = new Date().toISOString();
    const status: NotificationMessage['status'] = data.scheduledTime ? 'Scheduled' : 'Draft';
    const msg: NotificationMessage = {
      id: generateId(),
      ...data as any,
      status,
      read: false,
      createdBy: 'Admin User',
      createdAt: now,
      updatedAt: now,
    };
    const all = this.getAllFromStorage();
    all.push(msg);
    this.saveToStorage(all);
    await this.eventService.log(msg.id, 'Created', 'Admin User', undefined, status, `Notification created: ${data.title}`);
    return { success: true, data: msg };
  }

  // Sent notifications are read-only
  async update(id: string, data: Partial<Omit<NotificationMessage, 'id' | 'isDeleted' | 'createdAt'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(n => n.id === id);
    if (idx === -1) return { success: false, error: 'Notification not found' };
    if (all[idx].status === 'Sent') return { success: false, error: 'Sent notifications cannot be modified' };

    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    await this.eventService.log(id, 'Updated', undefined, undefined, all[idx].status, 'Notification updated');
    return { success: true, data: all[idx] };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(n => n.id === id);
    if (idx === -1) return { success: false, error: 'Notification not found' };
    if (all[idx].status === 'Sent') return { success: false, error: 'Sent notifications cannot be deleted' };

    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    await this.eventService.log(id, 'Deleted', undefined, all[idx].status, undefined, 'Notification deleted');
    return { success: true, data: all[idx] };
  }

  // Send (mock) — marks Draft/Scheduled as Sent
  async send(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(n => n.id === id);
    if (idx === -1) return { success: false, error: 'Notification not found' };
    if (all[idx].status === 'Sent') return { success: false, error: 'Notification already sent' };

    const oldStatus = all[idx].status;
    const now = new Date().toISOString();
    all[idx] = { ...all[idx], status: 'Sent', sentTime: now, updatedAt: now };
    this.saveToStorage(all);
    await this.eventService.log(id, 'Sent', undefined, oldStatus, 'Sent', 'Notification sent');
    return { success: true, data: all[idx] };
  }

  // Mark read/unread
  async markRead(id: string, userId?: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(n => n.id === id);
    if (idx === -1) return { success: false, error: 'Notification not found' };

    all[idx] = { ...all[idx], read: true, readAt: new Date().toISOString(), readBy: userId || 'Anonymous', updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return { success: true, data: all[idx] };
  }

  async markUnread(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(n => n.id === id);
    if (idx === -1) return { success: false, error: 'Notification not found' };

    all[idx] = { ...all[idx], read: false, readAt: undefined, readBy: undefined, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return { success: true, data: all[idx] };
  }

  async getByTarget(target: string) {
    const all = this.getAllFromStorage().filter(n => !n.isDeleted);
    return { success: true, data: all.filter(n => n.target === target || n.target === 'All') };
  }

  async getHistory(notificationId: string) {
    return this.eventService.getByNotification(notificationId);
  }

  async getAllHistory() {
    const all = this.eventService.getAllFromStorage() as NotificationEvent[];
    return { success: true, data: all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) };
  }
}

// Templates
class NotificationTemplateService extends BaseService<NotificationTemplate> {
  constructor() { super('notificationTemplates', INITIAL_NOTIFICATION_TEMPLATES as NotificationTemplate[]); }

  async create(data: {
    name: string; title: string; message: string;
    type: NotificationTemplate['type']; target: NotificationTemplate['target'];
    deliveryChannel: NotificationTemplate['deliveryChannel'];
  }) {
    const now = new Date().toISOString();
    const tmpl: NotificationTemplate = { id: generateId(), ...data, createdAt: now, updatedAt: now };
    const all = this.getAllFromStorage();
    all.push(tmpl);
    this.saveToStorage(all);
    return { success: true, data: tmpl };
  }

  async update(id: string, data: Partial<Omit<NotificationTemplate, 'id' | 'isDeleted' | 'createdAt'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return { success: false, error: 'Template not found' };
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return { success: true, data: all[idx] };
  }

  async softDelete(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return { success: false, error: 'Template not found' };
    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    return { success: true, data: all[idx] };
  }
}

export const notificationMessageService = new NotificationMessageService();
export const notificationTemplateService = new NotificationTemplateService();
