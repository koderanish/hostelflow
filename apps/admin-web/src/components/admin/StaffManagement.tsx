import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { staffService } from '../../services/staff.service';
import type { Staff } from '../../types';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { UserCog, Search, Plus, Mail, Phone, Loader2, Edit3, Trash2 } from 'lucide-react';

const staffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  status: z.enum(['Active', 'Inactive']),
});

type StaffFormData = z.infer<typeof staffSchema>;

export default function StaffManagement() {
  const { addToast } = useNotify();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: { status: 'Active' },
  });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const res = await staffService.getAll();
    if (res.success && res.data) setStaff(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const startEdit = (s: Staff) => {
    setEditingId(s.id); setShowForm(true);
    setValue('name', s.name);
    setValue('email', s.email);
    setValue('phone', s.phone);
    setValue('role', s.role);
    setValue('department', s.department);
    setValue('status', s.status);
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); reset(); };

  const onSubmit = async (formData: StaffFormData) => {
    setSubmitting(true);
    const data = { ...formData, joinDate: new Date().toISOString().split('T')[0] };
    let res: any;
    if (editingId) {
      res = await staffService.update(editingId, data);
    } else {
      res = await staffService.create(data as any);
    }
    if (res.success) {
      if (res.data?.generatedPassword) {
        addToast(`Staff created. Login: ${res.data.email} | Password: ${res.data.generatedPassword}`, 'success');
      } else {
        addToast(editingId ? 'Staff updated' : 'Staff created', 'success');
      }
      cancelForm(); fetchStaff();
    } else {
      addToast(res.error || 'Failed to save staff', 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await staffService.delete(deleteTarget.id);
    if (res.success) { addToast('Staff deleted', 'success'); setDeleteTarget(null); fetchStaff(); }
    else { addToast(res.error || 'Delete failed', 'error'); }
    setDeleting(false);
  };

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";
  const errorClass = "text-xs text-rose-500 mt-1";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
            <UserCog className="w-3.5 h-3.5" /> Team
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Staff Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage hostel staff</p>
        </div>
        <button onClick={() => { cancelForm(); setShowForm(true); }}
          className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center gap-2"><Plus className="w-4 h-4" /> Add Staff</span>
        </button>
      </div>

      <div className="relative max-w-sm group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
        <input type="text" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <UserCog className="w-12 h-12 mb-3" />
          <p className="text-sm font-medium">No staff found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s, idx) => (
            <div key={s.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 card-hover overflow-hidden" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-xl" />
              <div className="relative flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0">
                  {s.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.role}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500"><Mail className="w-3 h-3 shrink-0" /> {s.email}</p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500"><Phone className="w-3 h-3 shrink-0" /> {s.phone}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">{s.department}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${s.status === 'Active' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {s.status}
                    </span>
                  </div>
                  {s.joinDate && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Joined: {s.joinDate}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={cancelForm} title={editingId ? 'Edit Staff' : 'Add Staff'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Full Name *</label>
              <input type="text" {...register('name')} placeholder="e.g. John Doe" className={inputClass} />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Email *</label>
              <input type="email" {...register('email')} placeholder="e.g. john@hostel.com" className={inputClass} />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Phone *</label>
              <input type="text" {...register('phone')} placeholder="e.g. +91 9876543210" className={inputClass} />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Role *</label>
              <select {...register('role')} className={inputClass}>
                <option value="">Select role...</option>
                <option value="Warden">Warden</option>
                <option value="STAFF">Staff</option>
                <option value="Admin">Admin</option>
                <option value="Security">Security</option>
              </select>
              {errors.role && <p className={errorClass}>{errors.role.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Department *</label>
              <select {...register('department')} className={inputClass}>
                <option value="">Select department...</option>
                <option value="Hostel Management">Hostel Management</option>
                <option value="Administration">Administration</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Security">Security</option>
                <option value="Housekeeping">Housekeeping</option>
              </select>
              {errors.department && <p className={errorClass}>{errors.department.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Status *</label>
              <select {...register('status')} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={cancelForm}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Staff" message={`Remove "${deleteTarget?.name}" from staff?`} confirmLabel="Delete" variant="danger" loading={deleting} />
    </div>
  );
}
