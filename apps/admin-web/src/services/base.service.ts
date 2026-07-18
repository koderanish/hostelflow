import { mockApiCall, mockPaginatedApiCall } from '../api/client';
import { generateId } from '../utils';
import type { ApiResponse } from '../types';

export class BaseService<T extends { id: string }> {
  protected storageKey: string;
  protected data: T[];

  constructor(storageKey: string, initialData: T[]) {
    this.storageKey = storageKey;
    this.data = initialData;
  }

  getAllFromStorage(): T[] {
    return this.data;
  }

  saveToStorage(data: T[]): void {
    this.data = data;
  }

  async getAll(): Promise<ApiResponse<T[]>> {
    return mockApiCall(this.getAllFromStorage());
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    const item = this.getAllFromStorage().find(i => i.id === id);
    if (!item) return { success: false, error: 'Not found' };
    return mockApiCall(item);
  }

  async getByField(field: keyof T, value: unknown): Promise<ApiResponse<T[]>> {
    const results = this.getAllFromStorage().filter(i => i[field] === value);
    return mockApiCall(results);
  }

  async exists(field: keyof T, value: unknown): Promise<ApiResponse<boolean>> {
    const exists = this.getAllFromStorage().some(i => i[field] === value);
    return mockApiCall(exists);
  }

  async create(item: Omit<T, 'id'>): Promise<ApiResponse<T>> {
    const newItem = { id: generateId(), ...item } as T;
    const all = this.getAllFromStorage();
    all.push(newItem);
    this.saveToStorage(all);
    return mockApiCall(newItem);
  }

  async update(id: string, updates: Partial<T>): Promise<ApiResponse<T>> {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return { success: false, error: 'Not found' };
    all[idx] = { ...all[idx], ...updates };
    this.saveToStorage(all);
    return mockApiCall(all[idx]);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const all = this.getAllFromStorage();
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return { success: false, error: 'Not found' };
    all.splice(idx, 1);
    this.saveToStorage(all);
    return mockApiCall(undefined as void);
  }

  async getPaginated(
    page = 1, limit = 10, search?: string,
    filters?: Record<string, string>, sortBy?: string, sortOrder?: 'asc' | 'desc'
  ) {
    return mockPaginatedApiCall(this.getAllFromStorage(), page, limit, search, filters, sortBy, sortOrder);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    let all = this.getAllFromStorage();
    all = all.filter(i => !ids.includes(i.id));
    this.saveToStorage(all);
    return mockApiCall(undefined as void);
  }
}
