import { BaseService } from './base.service';
import type { ApiResponse, Staff } from '../types';
import { INITIAL_STAFF } from '../data';

class StaffService extends BaseService<Staff> {
  constructor() {
    super('staff', INITIAL_STAFF as Staff[], 'users');
  }

  private toStaff(u: any): Staff {
    return {
      id: u.id,
      name: u.fullName || u.name || '',
      role: u.role?.name || u.role || 'STAFF',
      phone: u.phone || '',
      email: u.email || '',
      department: u.department || 'General',
      joinDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
      status: u.status === false ? 'Inactive' : 'Active',
    };
  }

  private toBackend(item: Omit<Staff, 'id'>): any {
    return { fullName: item.name, email: item.email, phone: item.phone, role: item.role, status: item.status === 'Active' ? true : false };
  }

  async getAll(): Promise<ApiResponse<Staff[]>> {
    try {
      const res = await super.getAll();
      if (res.success && res.data && Array.isArray(res.data)) {
        const isFromApi = res.data.length > 0 && 'fullName' in res.data[0];
        if (isFromApi) {
          return { success: true, data: res.data.map(u => this.toStaff(u)) };
        }
      }
      return res;
    } catch {
      return { success: false, error: 'Failed to fetch' };
    }
  }

  async getById(id: string): Promise<ApiResponse<Staff>> {
    try {
      const res = await super.getById(id);
      if (res.success && res.data && 'fullName' in res.data) {
        return { success: true, data: this.toStaff(res.data) };
      }
      return res;
    } catch {
      return { success: false, error: 'Not found' };
    }
  }

  async create(item: Omit<Staff, 'id'>): Promise<ApiResponse<Staff>> {
    try {
      const res = await super.create(this.toBackend(item) as any);
      if (res.success && res.data) {
        const d = res.data as any;
        if (d.fullName || d.role?.name) {
          return { success: true, data: this.toStaff(d) };
        }
      }
      return res;
    } catch {
      return { success: false, error: 'Create failed' };
    }
  }

  async update(id: string, updates: Partial<Staff>): Promise<ApiResponse<Staff>> {
    try {
      const backendData: any = {};
      if (updates.name) backendData.fullName = updates.name;
      if (updates.email) backendData.email = updates.email;
      if (updates.phone !== undefined) backendData.phone = updates.phone;
      if (updates.role) backendData.role = updates.role;
      if (updates.status) backendData.status = updates.status === 'Active';
      const res = await super.update(id, backendData as any);
      if (res.success && res.data) {
        const d = res.data as any;
        if (d.fullName || d.role?.name) {
          return { success: true, data: this.toStaff(d) };
        }
      }
      return res;
    } catch {
      return { success: false, error: 'Update failed' };
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return super.delete(id);
  }
}

export const staffService = new StaffService();
