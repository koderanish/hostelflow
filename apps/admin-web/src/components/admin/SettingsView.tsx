import { useState, useEffect, useMemo } from 'react';
import {
  Settings, Building, Shield, Users, Database, ClipboardList,
  Globe, Clock, Bell, Moon, Sun, Monitor, Check, X, Plus, Edit3, Trash2,
  Download, Upload, RefreshCw, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { settingsService } from '../../services/settings.service';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { StatusBadge } from '../ui/StatusBadge';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../ui/ToastContainer';
import type {
  InstituteSettings, HostelSettings, SystemPreferences,
  Role, AuditLogEntry, BackupRecord,
} from '../../types';

const sections = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'hostel', label: 'Hostel Settings', icon: Building },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Globe },
  { id: 'backup', label: 'Backup & Restore', icon: Database },
  { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
];

type AuditFilters = { action: string; entityType: string; q: string; from: string; to: string };

const ACTION_OPTIONS = ['Created', 'Updated', 'Deleted'];
const ENTITY_OPTIONS = ['InstituteSettings', 'HostelSettings', 'SystemPreferences', 'Role', 'SMTPConfig', 'CloudinaryConfig', 'RazorpayConfig'];

export default function SettingsView() {
  const [activeSection, setActiveSection] = useState('general');
  const { addToast, toasts, removeToast } = useNotification();
  const { user } = useAuth();

  // Institute
  const [institute, setInstitute] = useState<InstituteSettings | null>(null);
  const [instForm, setInstForm] = useState<InstituteSettings | null>(null);

  // Hostel
  const [hostelSets, setHostelSets] = useState<HostelSettings | null>(null);
  const [hostelForm, setHostelForm] = useState<HostelSettings | null>(null);

  // Preferences
  const [prefs, setPrefs] = useState<SystemPreferences | null>(null);
  const [prefsForm, setPrefsForm] = useState<SystemPreferences | null>(null);

  // Roles
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleModal, setRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: '' });
  const [roleError, setRoleError] = useState('');
  const [deleteRoleConfirm, setDeleteRoleConfirm] = useState<Role | null>(null);

  // Backup
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [backingUp, setBackingUp] = useState(false);

  // Audit
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditFilters, setAuditFilters] = useState<AuditFilters>({ action: '', entityType: '', q: '', from: '', to: '' });
  const [auditPage, setAuditPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    settingsService.getInstitute().then(r => { if (r.success && r.data) { setInstitute(r.data); setInstForm(r.data); } });
    settingsService.getHostelSettings().then(r => { if (r.success && r.data) { setHostelSets(r.data); setHostelForm(r.data); } });
    settingsService.getPreferences().then(r => { if (r.success && r.data) { setPrefs(r.data); setPrefsForm(r.data); } });
    settingsService.getRoles().then(r => { if (r.success && r.data) setRoles(r.data); });
    loadBackups();
    loadAuditLogs();
  }, []);

  const loadBackups = () => {
    const all = settingsService.backup.getAllFromStorage();
    setBackups([...all]);
  };

  const loadAuditLogs = () => {
    const all = settingsService.auditLog.getAllFromStorage();
    setAuditLogs([...all]);
  };

  const performedBy = user?.name || 'Admin';

  // Institute save
  const handleSaveInstitute = async () => {
    if (!instForm || !institute) return;
    const res = await settingsService.updateInstitute(instForm, performedBy);
    if (res.success && res.data) {
      setInstitute(res.data);
      setInstForm(res.data);
      addToast('Institute settings saved', 'success');
      loadAuditLogs();
    }
  };

  // Hostel save
  const handleSaveHostel = async () => {
    if (!hostelForm || !hostelSets) return;
    const res = await settingsService.updateHostelSettings(hostelForm, performedBy);
    if (res.success && res.data) {
      setHostelSets(res.data);
      setHostelForm(res.data);
      addToast('Hostel settings saved', 'success');
      loadAuditLogs();
    }
  };

  // Preferences save
  const handleSavePrefs = async () => {
    if (!prefsForm || !prefs) return;
    const res = await settingsService.updatePreferences(prefsForm, performedBy);
    if (res.success && res.data) {
      setPrefs(res.data);
      setPrefsForm(res.data);
      addToast('Preferences saved', 'success');
      loadAuditLogs();
    }
  };

  // Role CRUD
  const openRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({ name: role.name, description: role.description, permissions: role.permissions.join(', ') });
    } else {
      setEditingRole(null);
      setRoleForm({ name: '', description: '', permissions: '' });
    }
    setRoleError('');
    setRoleModal(true);
  };

  const handleSaveRole = async () => {
    setRoleError('');
    if (!roleForm.name.trim()) { setRoleError('Role name is required'); return; }
    if (editingRole) {
      const res = await settingsService.updateRole(editingRole.id, {
        name: roleForm.name, description: roleForm.description,
        permissions: roleForm.permissions.split(',').map(p => p.trim()).filter(Boolean),
      }, performedBy);
      if (!res.success) { setRoleError(res.error || ''); return; }
      addToast('Role updated', 'success');
    } else {
      const res = await settingsService.createRole({
        name: roleForm.name, description: roleForm.description,
        permissions: roleForm.permissions.split(',').map(p => p.trim()).filter(Boolean),
      }, performedBy);
      if (!res.success) { setRoleError(res.error || ''); return; }
      addToast('Role created', 'success');
    }
    setRoleModal(false);
    const r = await settingsService.getRoles();
    if (r.success && r.data) setRoles(r.data);
    loadAuditLogs();
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleConfirm) return;
    const res = await settingsService.deleteRole(deleteRoleConfirm.id, performedBy);
    if (!res.success) { addToast(res.error || 'Cannot delete role', 'error'); setDeleteRoleConfirm(null); return; }
    addToast('Role deleted', 'success');
    setDeleteRoleConfirm(null);
    const r = await settingsService.getRoles();
    if (r.success && r.data) setRoles(r.data);
    loadAuditLogs();
  };

  // Backup
  const handleCreateBackup = async () => {
    setBackingUp(true);
    const res = await settingsService.backup.createBackup(performedBy);
    if (res.success) addToast('Backup initiated', 'info');
    loadBackups();
    setTimeout(() => { setBackingUp(false); loadBackups(); }, 2500);
  };

  const handleRestoreBackup = async (id: string) => {
    const res = await settingsService.backup.restoreBackup(id);
    if (res.success) addToast('Backup restored successfully (mock)', 'success');
    else addToast(res.error || 'Restore failed', 'error');
  };

  // Audit filtered + paginated
  const filteredAudit = useMemo(() => {
    let items = [...auditLogs];
    if (auditFilters.action) items = items.filter(e => e.action === auditFilters.action);
    if (auditFilters.entityType) items = items.filter(e => e.entityType === auditFilters.entityType);
    if (auditFilters.q) {
      const q = auditFilters.q.toLowerCase();
      items = items.filter(e => e.performedBy.toLowerCase().includes(q) || e.details?.toLowerCase().includes(q) || e.entityType.toLowerCase().includes(q));
    }
    if (auditFilters.from) items = items.filter(e => new Date(e.timestamp) >= new Date(auditFilters.from));
    if (auditFilters.to) items = items.filter(e => new Date(e.timestamp) <= new Date(auditFilters.to));
    return items;
  }, [auditLogs, auditFilters]);

  const totalPages = Math.ceil(filteredAudit.length / pageSize);
  const paginatedAudit = filteredAudit.slice((auditPage - 1) * pageSize, auditPage * pageSize);

  const renderSection = () => {
    switch (activeSection) {
      case 'general': return renderGeneral();
      case 'hostel': return renderHostel();
      case 'roles': return renderRoles();
      case 'preferences': return renderPreferences();
      case 'backup': return renderBackup();
      case 'audit': return renderAudit();
      default: return null;
    }
  };

  // --- General ---
  const renderGeneral = () => {
    if (!instForm) return null;
    return (
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">General Settings</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-3">Configure institute information</p>
        <div className="space-y-4">
          {([
            { label: 'Institute Name', key: 'name', type: 'text' },
            { label: 'Address', key: 'address', type: 'text' },
            { label: 'Phone', key: 'phone', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Website', key: 'website', type: 'text' },
            { label: 'Academic Year', key: 'academicYear', type: 'text' },
            { label: 'Current Semester', key: 'currentSemester', type: 'text' },
          ] as const).map(f => (
            <label key={f.key} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <div>
                <p className="text-sm text-neutral-900 dark:text-white">{f.label}</p>
              </div>
              <input type={f.type} value={(instForm as any)[f.key] || ''}
                onChange={e => setInstForm({ ...instForm, [f.key]: e.target.value })}
                className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-sm text-right w-64" />
            </label>
          ))}
        </div>
        <button onClick={handleSaveInstitute} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium">Save Changes</button>
      </div>
    );
  };

  // --- Hostel ---
  const renderHostel = () => {
    if (!hostelForm) return null;
    return (
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Hostel Settings</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-3">Configure hostel-specific rules and fees</p>
        <div className="space-y-4">
          {([
            { label: 'Check-In Time', key: 'checkInTime', type: 'time' },
            { label: 'Check-Out Time', key: 'checkOutTime', type: 'time' },
          ] as const).map(f => (
            <label key={f.key} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <div>
                <p className="text-sm text-neutral-900 dark:text-white">{f.label}</p>
              </div>
              <input type={f.type} value={(hostelForm as any)[f.key] || ''}
                onChange={e => setHostelForm({ ...hostelForm, [f.key]: e.target.value })}
                className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-sm" />
            </label>
          ))}
          {([
            { label: 'Late Fee Per Day', key: 'lateFeePerDay', type: 'number' },
            { label: 'Mess Fee Per Month', key: 'messFeePerMonth', type: 'number' },
          ] as const).map(f => (
            <label key={f.key} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <div>
                <p className="text-sm text-neutral-900 dark:text-white">{f.label}</p>
              </div>
              <input type={f.type} value={(hostelForm as any)[f.key] || 0}
                onChange={e => setHostelForm({ ...hostelForm, [f.key]: Number(e.target.value) })}
                className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-sm text-right w-32" />
            </label>
          ))}
          {([
            { label: 'Allow Overnight', key: 'allowOvernight' },
            { label: 'Visitor Allowed', key: 'visitorAllowed' },
            { label: 'Parent Approval Required', key: 'parentApprovalRequired' },
          ] as const).map(f => (
            <label key={f.key} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{f.label}</span>
              <input type="checkbox" checked={(hostelForm as any)[f.key] as boolean}
                onChange={e => setHostelForm({ ...hostelForm, [f.key]: e.target.checked })}
                className="rounded border-neutral-300 text-blue-600" />
            </label>
          ))}
        </div>
        <button onClick={handleSaveHostel} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium">Save Changes</button>
      </div>
    );
  };

  // --- Roles ---
  const renderRoles = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">User & Role Management</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Manage roles and their permissions</p>
        </div>
        <button onClick={() => openRoleModal()} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-medium">
          <Plus className="w-3.5 h-3.5" /> Add Role
        </button>
      </div>
      <div className="space-y-2">
        {roles.map(role => (
          <div key={role.id} className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{role.name}</p>
                {role.isDefault && <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded text-[10px] font-medium">Default</span>}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{role.description}</p>
              {role.permissions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {role.permissions.map(p => (
                    <span key={p} className="px-1.5 py-0.5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400 rounded text-[10px] font-medium">{p}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 ml-4">
              <button onClick={() => openRoleModal(role)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              {!role.isDefault && (
                <button onClick={() => setDeleteRoleConfirm(role)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {renderRoleModal()}
      <ConfirmDialog isOpen={!!deleteRoleConfirm} onClose={() => setDeleteRoleConfirm(null)} onConfirm={handleDeleteRole}
        title="Delete Role" message={`Are you sure you want to delete the role "${deleteRoleConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete" variant="danger" />
    </div>
  );

  const renderRoleModal = () => (
    <Modal isOpen={roleModal} onClose={() => setRoleModal(false)} title={editingRole ? 'Edit Role' : 'Create Role'} size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Role Name</label>
          <input value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label>
          <input value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Permissions (comma-separated)</label>
          <textarea value={roleForm.permissions} onChange={e => setRoleForm({ ...roleForm, permissions: e.target.value })}
            rows={3} placeholder="e.g. hostel:read, hostel:write, student:read"
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
        </div>
        {roleError && <p className="text-xs text-red-600">{roleError}</p>}
        <div className="flex gap-3 pt-2">
          <button onClick={() => setRoleModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
          <button onClick={handleSaveRole} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-medium transition-colors">{editingRole ? 'Update' : 'Create'}</button>
        </div>
      </div>
    </Modal>
  );

  // --- Preferences ---
  const renderPreferences = () => {
    if (!prefsForm) return null;
    const themes = [
      { value: 'light', Icon: Sun, label: 'Light' },
      { value: 'dark', Icon: Moon, label: 'Dark' },
      { value: 'system', Icon: Monitor, label: 'System' },
    ] as const;
    return (
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">System Preferences</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-3">Theme, language, timezone, and notifications</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Theme</label>
            <div className="flex gap-2">
              {themes.map(t => {
                const Icon = t.Icon;
                const active = prefsForm.theme === t.value;
                return (
                  <button key={t.value} onClick={() => setPrefsForm({ ...prefsForm, theme: t.value })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                      active ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}>
                    <Icon className="w-4 h-4" /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Language</span>
              <select value={prefsForm.language} onChange={e => setPrefsForm({ ...prefsForm, language: e.target.value })}
                className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-sm">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Timezone</span>
              <select value={prefsForm.timezone} onChange={e => setPrefsForm({ ...prefsForm, timezone: e.target.value })}
                className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-sm">
                <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
              </select>
            </label>
          </div>

          <label className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
            <div>
              <p className="text-sm text-neutral-900 dark:text-white">Attendance Cutoff Time</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Late after this time</p>
            </div>
            <input type="time" value={prefsForm.attendanceCutoffTime} onChange={e => setPrefsForm({ ...prefsForm, attendanceCutoffTime: e.target.value })}
              className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-sm" />
          </label>

          <label className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
            <div>
              <p className="text-sm text-neutral-900 dark:text-white">Fee Due Reminder (days before)</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">When to send reminders</p>
            </div>
            <input type="number" min={1} max={30} value={prefsForm.feeDueReminderDays} onChange={e => setPrefsForm({ ...prefsForm, feeDueReminderDays: Number(e.target.value) })}
              className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg text-sm text-right w-20" />
          </label>

          <div>
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Notification Preferences</p>
            <div className="space-y-1">
              {(Object.keys(prefsForm.notificationPreferences) as (keyof typeof prefsForm.notificationPreferences)[]).map(key => {
                const label = key.replace(/([A-Z])/g, ' $1').trim();
                return (
                  <label key={key as string} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 capitalize">{label}</span>
                    <input type="checkbox" checked={prefsForm.notificationPreferences[key] as boolean}
                      onChange={e => setPrefsForm({
                        ...prefsForm,
                        notificationPreferences: { ...prefsForm.notificationPreferences, [key]: e.target.checked },
                      })}
                      className="rounded border-neutral-300 text-blue-600" />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <button onClick={handleSavePrefs} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium">Save Changes</button>
      </div>
    );
  };

  // --- Backup ---
  const renderBackup = () => (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Backup & Restore</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-3">Manage database backups and restoration</p>

      <div className="flex gap-3">
        <button onClick={handleCreateBackup} disabled={backingUp}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors">
          {backingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {backingUp ? 'Creating Backup...' : 'Create Backup'}
        </button>
        <button onClick={() => addToast('Auto-backup scheduled (mock)', 'info')}
          className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <Clock className="w-4 h-4" /> Schedule Auto-Backup
        </button>
      </div>

      <div className="space-y-2">
        {backups.map(b => (
          <div key={b.id} className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{b.fileName}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{b.fileSize} &middot; {new Date(b.createdAt).toLocaleDateString()} &middot; {b.performedBy}</p>
                {b.notes && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{b.notes}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={b.status} />
              {b.status === 'Completed' && (
                <button onClick={() => handleRestoreBackup(b.id)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Audit ---
  const renderAudit = () => (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Audit Logs</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-3">Track all configuration changes</p>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input placeholder="Search logs..." value={auditFilters.q}
            onChange={e => { setAuditFilters(f => ({ ...f, q: e.target.value })); setAuditPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <select value={auditFilters.action} onChange={e => { setAuditFilters(f => ({ ...f, action: e.target.value })); setAuditPage(1); }}
          className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm">
          <option value="">All Actions</option>
          {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={auditFilters.entityType} onChange={e => { setAuditFilters(f => ({ ...f, entityType: e.target.value })); setAuditPage(1); }}
          className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm">
          <option value="">All Entities</option>
          {ENTITY_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <input type="date" value={auditFilters.from} onChange={e => { setAuditFilters(f => ({ ...f, from: e.target.value })); setAuditPage(1); }}
          className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
        <input type="date" value={auditFilters.to} onChange={e => { setAuditFilters(f => ({ ...f, to: e.target.value })); setAuditPage(1); }}
          className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Action</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Entity</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Field</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Old Value</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">New Value</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">By</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAudit.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-neutral-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                      <p>No audit logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAudit.map(log => (
                  <tr key={log.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-4"><StatusBadge status={log.action === 'Created' ? 'Approved' : log.action === 'Deleted' ? 'Rejected' : 'Partially Paid'} /></td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">{log.entityType}</td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">{log.field || '-'}</td>
                    <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400 max-w-[150px] truncate">{log.oldValue || '-'}</td>
                    <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400 max-w-[150px] truncate">{log.newValue || '-'}</td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">{log.performedBy}</td>
                    <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-xs text-neutral-500">{filteredAudit.length} total logs</span>
            <div className="flex items-center gap-1">
              <button disabled={auditPage <= 1} onClick={() => setAuditPage(p => p - 1)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-xs text-neutral-600 dark:text-neutral-400">Page {auditPage} of {totalPages}</span>
              <button disabled={auditPage >= totalPages} onClick={() => setAuditPage(p => p + 1)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Configure system preferences</p>
      </div>

      <div className="flex gap-6">
        <div className="w-48 shrink-0 space-y-1">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === s.id
                    ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400 font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}>
                <Icon className="w-4 h-4" /> {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          {renderSection()}
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
