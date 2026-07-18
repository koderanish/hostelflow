import { BaseService } from './base.service';
import type { MessMenu, MealAttendance, MealRequest, DietaryPreference } from '../types';
import { INITIAL_MESS_MENU, INITIAL_MEAL_REQUESTS } from '../data';
import { generateId } from '../utils';

interface MessEvent {
  id: string;
  entityType: string;
  entityId: string;
  eventType: string;
  timestamp: string;
  details?: string;
}

class MessEventService extends BaseService<MessEvent> {
  constructor() { super('mess-events', []); }

  async log(entityType: string, entityId: string, eventType: string, details?: string) {
    const evt: MessEvent = {
      id: generateId(), entityType, entityId, eventType,
      timestamp: new Date().toISOString(), details,
    };
    const all = this.getAllFromStorage();
    all.push(evt);
    this.saveToStorage(all);
  }

  async getByEntity(entityId: string) {
    return this.getByField('entityId', entityId);
  }
}

class MessService extends BaseService<MessMenu> {
  private eventService: MessEventService;

  constructor() {
    super('messMenu', INITIAL_MESS_MENU as MessMenu[]);
    this.eventService = new MessEventService();
  }

  // ---- Menu CRUD ----

  async addMenu(data: {
    day: string; breakfast: string; lunch: string; snacks: string; dinner: string;
    special?: string;
  }) {
    const all = this.getAllFromStorage();
    const now = new Date().toISOString();
    const menu: MessMenu = {
      id: generateId(), ...data, isActive: true, createdAt: now, updatedAt: now,
    };
    all.push(menu);
    this.saveToStorage(all);
    await this.eventService.log('MessMenu', menu.id, 'Created', `Menu for ${data.day} created`);
    return { success: true, data: menu };
  }

  async updateMenu(id: string, data: Partial<Omit<MessMenu, 'id' | 'isDeleted' | 'createdAt'>>) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(m => m.id === id);
    if (idx === -1) return { success: false, error: 'Menu not found' };
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    await this.eventService.log('MessMenu', id, 'Updated', 'Menu updated');
    return { success: true, data: all[idx] };
  }

  async softDeleteMenu(id: string) {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(m => m.id === id);
    if (idx === -1) return { success: false, error: 'Menu not found' };
    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    this.saveToStorage(all);
    await this.eventService.log('MessMenu', id, 'Deleted', 'Menu deleted');
    return { success: true, data: all[idx] };
  }

  // ---- Meal Attendance ----

  async getAttendance(filters?: { date?: string; mealType?: string; studentId?: string }) {
    const service = new (BaseService as any)('mealAttendance', []) as BaseService<MealAttendance>;
    let all = service.getAllFromStorage() as MealAttendance[];
    if (filters?.date) all = all.filter(a => a.date === filters.date);
    if (filters?.mealType) all = all.filter(a => a.mealType === filters.mealType);
    if (filters?.studentId) all = all.filter(a => a.studentId === filters.studentId);
    return { success: true, data: all };
  }

  // Business rule: One attendance per meal per student - cannot mark twice
  async markAttendance(data: {
    studentId: string; studentName: string; date: string;
    mealType: MealAttendance['mealType']; status: MealAttendance['status']; remarks?: string;
  }) {
    const service = new (BaseService as any)('mealAttendance', []) as BaseService<MealAttendance>;
    const all = service.getAllFromStorage() as MealAttendance[];

    const existing = all.find(
      a => a.studentId === data.studentId && a.date === data.date && a.mealType === data.mealType
    );
    if (existing) {
      return { success: false, error: `Attendance already marked for ${data.studentName} on ${data.date} (${data.mealType})` };
    }

    const record: MealAttendance = {
      id: generateId(),
      studentId: data.studentId,
      studentName: data.studentName,
      date: data.date,
      mealType: data.mealType,
      status: data.status,
      remarks: data.remarks,
    };
    all.push(record);
    service.saveToStorage(all);
    await this.eventService.log('MealAttendance', record.id, 'Marked', `${data.studentName} - ${data.mealType} - ${data.status}`);
    return { success: true, data: record };
  }

  async updateAttendance(id: string, status: MealAttendance['status'], remarks?: string) {
    const service = new (BaseService as any)('mealAttendance', []) as BaseService<MealAttendance>;
    const all = service.getAllFromStorage() as MealAttendance[];
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Attendance record not found' };
    all[idx] = { ...all[idx], status, remarks: remarks ?? all[idx].remarks };
    service.saveToStorage(all);
    await this.eventService.log('MealAttendance', id, 'Updated', `Status changed to ${status}`);
    return { success: true, data: all[idx] };
  }

  // ---- Meal Requests ----

  async getRequests(filters?: { status?: string; date?: string; studentId?: string }) {
    const service = new (BaseService as any)('mealRequests', INITIAL_MEAL_REQUESTS) as BaseService<MealRequest>;
    let all = service.getAllFromStorage() as MealRequest[];
    if (filters?.status) all = all.filter(r => r.status === filters.status);
    if (filters?.date) all = all.filter(r => r.date === filters.date);
    if (filters?.studentId) all = all.filter(r => r.studentId === filters.studentId);
    return { success: true, data: all };
  }

  async addRequest(data: {
    studentId: string; studentName: string; date: string;
    mealType: MealRequest['mealType']; items: string; reason: string;
    dietaryPreference?: string;
  }) {
    const service = new (BaseService as any)('mealRequests', INITIAL_MEAL_REQUESTS) as BaseService<MealRequest>;
    const all = service.getAllFromStorage() as MealRequest[];
    const now = new Date().toISOString();
    const req: MealRequest = {
      id: generateId(), ...data, status: 'Pending', createdAt: now, updatedAt: now,
    };
    all.push(req);
    service.saveToStorage(all);
    await this.eventService.log('MealRequest', req.id, 'Created', `Request by ${data.studentName} for ${data.mealType} on ${data.date}`);
    return { success: true, data: req };
  }

  // Business rules: status transitions
  async approveRequest(id: string, remarks?: string) {
    const service = new (BaseService as any)('mealRequests', INITIAL_MEAL_REQUESTS) as BaseService<MealRequest>;
    const all = service.getAllFromStorage() as MealRequest[];
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, error: 'Request not found' };
    if (all[idx].status !== 'Pending') return { success: false, error: 'Can only approve pending requests' };
    all[idx] = { ...all[idx], status: 'Approved', remarks: remarks ?? all[idx].remarks, updatedAt: new Date().toISOString() };
    service.saveToStorage(all);
    await this.eventService.log('MealRequest', id, 'Approved', remarks || 'Approved');
    return { success: true, data: all[idx] };
  }

  async rejectRequest(id: string, remarks: string) {
    const service = new (BaseService as any)('mealRequests', INITIAL_MEAL_REQUESTS) as BaseService<MealRequest>;
    const all = service.getAllFromStorage() as MealRequest[];
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, error: 'Request not found' };
    if (all[idx].status !== 'Pending') return { success: false, error: 'Can only reject pending requests' };
    if (!remarks.trim()) return { success: false, error: 'Remarks required for rejection' };
    all[idx] = { ...all[idx], status: 'Rejected', remarks, updatedAt: new Date().toISOString() };
    service.saveToStorage(all);
    await this.eventService.log('MealRequest', id, 'Rejected', remarks);
    return { success: true, data: all[idx] };
  }

  async deleteRequest(id: string) {
    const service = new (BaseService as any)('mealRequests', INITIAL_MEAL_REQUESTS) as BaseService<MealRequest>;
    const all = service.getAllFromStorage() as MealRequest[];
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, error: 'Request not found' };
    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
    service.saveToStorage(all);
    await this.eventService.log('MealRequest', id, 'Deleted', 'Request deleted');
    return { success: true, data: all[idx] };
  }

  // ---- History ----

  async getHistory(entityId?: string) {
    if (entityId) return this.eventService.getByEntity(entityId);
    const all = this.eventService.getAllFromStorage() as MessEvent[];
    return { success: true, data: all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) };
  }
}

export const messService = new MessService();
