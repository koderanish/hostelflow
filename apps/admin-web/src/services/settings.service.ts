import { BaseService } from './base.service';
import type {
  InstituteSettings, HostelSettings, SystemPreferences,
  Role, AuditLogEntry, BackupRecord, SMTPConfig, CloudinaryConfig, RazorpayConfig,
} from '../types';
import {
  INITIAL_INSTITUTE_SETTINGS, INITIAL_HOSTEL_SETTINGS,
  INITIAL_SYSTEM_PREFERENCES, INITIAL_ROLES,
  INITIAL_AUDIT_LOGS, INITIAL_BACKUP_RECORDS,
  INITIAL_SMTP_CONFIG, INITIAL_CLOUDINARY_CONFIG, INITIAL_RAZORPAY_CONFIG,
} from '../data';
import { generateId } from '../utils';

class AuditLogService extends BaseService<AuditLogEntry> {
  constructor() { super('audit-logs', INITIAL_AUDIT_LOGS); }

  async log(action: string, entityType: string, entityId: string, performedBy: string, field?: string, oldValue?: string, newValue?: string, details?: string) {
    const entry: AuditLogEntry = {
      id: generateId(), action, entityType, entityId,
      field: field || '', oldValue: oldValue || '', newValue: newValue || '',
      performedBy, timestamp: new Date().toISOString(), details,
    };
    const all = this.getAllFromStorage();
    all.unshift(entry);
    this.saveToStorage(all);
  }

  async search(params: { action?: string; entityType?: string; q?: string; from?: string; to?: string }) {
    let items = this.getAllFromStorage();
    if (params.action) items = items.filter(e => e.action === params.action);
    if (params.entityType) items = items.filter(e => e.entityType === params.entityType);
    if (params.q) {
      const q = params.q.toLowerCase();
      items = items.filter(e =>
        e.performedBy.toLowerCase().includes(q) ||
        e.details?.toLowerCase().includes(q) ||
        e.entityType.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q)
      );
    }
    if (params.from) items = items.filter(e => new Date(e.timestamp) >= new Date(params.from!));
    if (params.to) items = items.filter(e => new Date(e.timestamp) <= new Date(params.to!));
    return { success: true, data: items };
  }
}

class BackupService extends BaseService<BackupRecord> {
  constructor() { super('backup-records', INITIAL_BACKUP_RECORDS); }

  async createBackup(performedBy: string) {
    const record: BackupRecord = {
      id: generateId(),
      fileName: `backup_${new Date().toISOString().slice(0, 10)}.sql`,
      fileSize: '0 MB',
      status: 'In Progress',
      createdAt: new Date().toISOString(),
      performedBy,
      notes: 'Manual backup initiated',
    };
    const all = this.getAllFromStorage();
    all.unshift(record);
    this.saveToStorage(all);
    setTimeout(() => {
      const current = this.getAllFromStorage();
      const idx = current.findIndex(r => r.id === record.id);
      if (idx !== -1) {
        current[idx] = { ...current[idx], status: 'Completed', fileSize: '260 MB' };
        this.saveToStorage(current);
      }
    }, 2000);
    return { success: true, data: record };
  }

  async restoreBackup(id: string) {
    const all = this.getAllFromStorage();
    const record = all.find(r => r.id === id);
    if (!record) return { success: false, error: 'Backup record not found' };
    if (record.status !== 'Completed') return { success: false, error: 'Only completed backups can be restored' };
    return { success: true, data: record };
  }
}

// Future API: GET /settings, PUT /settings
class SettingsService {
  private instituteData: InstituteSettings[];
  private hostelData: HostelSettings[];
  private smtpData: SMTPConfig[];
  private cloudinaryData: CloudinaryConfig[];
  private razorpayData: RazorpayConfig[];
  private preferencesData: SystemPreferences[];
  private rolesData: Role[];
  auditLog: AuditLogService;
  backup: BackupService;

  constructor() {
    this.instituteData = [INITIAL_INSTITUTE_SETTINGS];
    this.hostelData = [INITIAL_HOSTEL_SETTINGS];
    this.smtpData = [INITIAL_SMTP_CONFIG];
    this.cloudinaryData = [INITIAL_CLOUDINARY_CONFIG];
    this.razorpayData = [INITIAL_RAZORPAY_CONFIG];
    this.preferencesData = [INITIAL_SYSTEM_PREFERENCES];
    this.rolesData = [...INITIAL_ROLES];
    this.auditLog = new AuditLogService();
    this.backup = new BackupService();
  }

  // Institute
  async getInstitute() {
    return { success: true, data: this.instituteData[0] };
  }
  async updateInstitute(data: Partial<InstituteSettings>, performedBy: string) {
    const old = { ...this.instituteData[0] };
    this.instituteData[0] = { ...this.instituteData[0], ...data };
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && (old as any)[key] !== value) {
        this.auditLog.log('Updated', 'InstituteSettings', this.instituteData[0].id, performedBy, key, String(old[key as keyof InstituteSettings] ?? ''), String(value ?? ''));
      }
    });
    return { success: true, data: this.instituteData[0] };
  }

  // Hostel
  async getHostelSettings() {
    return { success: true, data: this.hostelData[0] };
  }
  async updateHostelSettings(data: Partial<HostelSettings>, performedBy: string) {
    const old = { ...this.hostelData[0] };
    this.hostelData[0] = { ...this.hostelData[0], ...data };
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && (old as any)[key] !== value) {
        this.auditLog.log('Updated', 'HostelSettings', this.hostelData[0].id, performedBy, key, String(old[key as keyof HostelSettings] ?? ''), String(value ?? ''));
      }
    });
    return { success: true, data: this.hostelData[0] };
  }

  // SMTP
  async getSMTPConfig() {
    return { success: true, data: this.smtpData[0] };
  }
  async updateSMTPConfig(data: Partial<SMTPConfig>, performedBy: string) {
    const old = { ...this.smtpData[0] };
    this.smtpData[0] = { ...this.smtpData[0], ...data };
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && (old as any)[key] !== value) {
        this.auditLog.log('Updated', 'SMTPConfig', 'smtp1', performedBy, key, String(old[key as keyof SMTPConfig] ?? ''), String(value ?? ''));
      }
    });
    return { success: true, data: this.smtpData[0] };
  }

  // Cloudinary
  async getCloudinaryConfig() {
    return { success: true, data: this.cloudinaryData[0] };
  }
  async updateCloudinaryConfig(data: Partial<CloudinaryConfig>, performedBy: string) {
    this.cloudinaryData[0] = { ...this.cloudinaryData[0], ...data };
    this.auditLog.log('Updated', 'CloudinaryConfig', 'cc1', performedBy, 'config', '', 'Updated');
    return { success: true, data: this.cloudinaryData[0] };
  }

  // Razorpay
  async getRazorpayConfig() {
    return { success: true, data: this.razorpayData[0] };
  }
  async updateRazorpayConfig(data: Partial<RazorpayConfig>, performedBy: string) {
    this.razorpayData[0] = { ...this.razorpayData[0], ...data };
    this.auditLog.log('Updated', 'RazorpayConfig', 'rc1', performedBy, 'config', '', 'Updated');
    return { success: true, data: this.razorpayData[0] };
  }

  // System Preferences
  async getPreferences() {
    return { success: true, data: this.preferencesData[0] };
  }
  async updatePreferences(data: Partial<SystemPreferences>, performedBy: string) {
    const old = { ...this.preferencesData[0] };
    this.preferencesData[0] = { ...this.preferencesData[0], ...data };
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'notificationPreferences') {
        if ((old as any)[key] !== value) {
          this.auditLog.log('Updated', 'SystemPreferences', this.preferencesData[0].id, performedBy, key, String((old as any)[key] ?? ''), String(value ?? ''));
        }
      }
    });
    if (data.notificationPreferences && JSON.stringify(old.notificationPreferences) !== JSON.stringify(data.notificationPreferences)) {
      this.auditLog.log('Updated', 'SystemPreferences', this.preferencesData[0].id, performedBy, 'notificationPreferences', JSON.stringify(old.notificationPreferences), JSON.stringify(data.notificationPreferences));
    }
    return { success: true, data: this.preferencesData[0] };
  }

  // Roles
  async getRoles() {
    return { success: true, data: [...this.rolesData] };
  }
  async getRole(id: string) {
    const role = this.rolesData.find(r => r.id === id);
    if (!role) return { success: false, error: 'Role not found' };
    return { success: true, data: role };
  }
  // Validate unique role names
  async createRole(data: { name: string; description: string; permissions: string[]; isDefault?: boolean }, performedBy: string) {
    if (this.rolesData.some(r => r.name.toLowerCase() === data.name.toLowerCase())) {
      return { success: false, error: 'Role name must be unique' };
    }
    const role: Role = {
      id: generateId(), name: data.name, description: data.description,
      permissions: data.permissions, isDefault: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    this.rolesData.push(role);
    this.auditLog.log('Created', 'Role', role.id, performedBy, '', '', role.name, `Created new role: ${role.name}`);
    return { success: true, data: role };
  }
  // Prevent deletion of default roles
  async updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }, performedBy: string) {
    const idx = this.rolesData.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, error: 'Role not found' };
    const old = { ...this.rolesData[idx] };
    // Check unique name
    if (data.name && data.name.toLowerCase() !== old.name.toLowerCase() &&
        this.rolesData.some(r => r.name.toLowerCase() === data.name.toLowerCase())) {
      return { success: false, error: 'Role name must be unique' };
    }
    this.rolesData[idx] = { ...this.rolesData[idx], ...data, updatedAt: new Date().toISOString() };
    Object.entries(data).forEach(([key, value]) => {
      if ((old as any)[key] !== value) {
        this.auditLog.log('Updated', 'Role', id, performedBy, key, String((old as any)[key] ?? ''), String(value ?? ''));
      }
    });
    return { success: true, data: this.rolesData[idx] };
  }
  // Prevent deletion of default roles
  async deleteRole(id: string, performedBy: string) {
    const idx = this.rolesData.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, error: 'Role not found' };
    if (this.rolesData[idx].isDefault) return { success: false, error: 'Default roles cannot be deleted' };
    const deleted = this.rolesData[idx];
    this.rolesData.splice(idx, 1);
    this.auditLog.log('Deleted', 'Role', id, performedBy, '', deleted.name, '', `Deleted role: ${deleted.name}`);
    return { success: true };
  }
}

export const settingsService = new SettingsService();
