import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { notificationTemplateService } from '../../services/notification-message.service';
import type { NotificationTemplate } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Plus, FileText, Loader2, Edit3, Trash2 } from 'lucide-react';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['Info', 'Success', 'Warning', 'Error']),
  target: z.enum(['All', 'Student', 'Warden', 'Staff', 'Admin']),
  deliveryChannel: z.enum(['In-App', 'Email', 'SMS']),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export function NotificationTemplatesPage() {
  const { addToast } = useNotify();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NotificationTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: { deliveryChannel: 'In-App' },
  });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const res = await notificationTemplateService.getAll();
    if (res.success && res.data) setTemplates(res.data.filter((t: NotificationTemplate) => !t.isDeleted));
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const startEdit = (t: NotificationTemplate) => {
    setEditingId(t.id); setShowForm(true);
    setValue('name', t.name); setValue('title', t.title); setValue('message', t.message);
    setValue('type', t.type); setValue('target', t.target); setValue('deliveryChannel', t.deliveryChannel);
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); reset(); };

  const onSubmit = async (data: TemplateFormData) => {
    setSubmitting(true);
    let res: any;
    if (editingId) {
      res = await notificationTemplateService.update(editingId, data);
    } else {
      res = await notificationTemplateService.create(data);
    }
    if (res.success) {
      addToast(editingId ? 'Template updated' : 'Template created', 'success');
      cancelForm(); fetchTemplates();
    } else {
      addToast(res.error || 'Failed to save template', 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await notificationTemplateService.softDelete(deleteTarget.id);
    if (res.success) { addToast('Template deleted', 'success'); setDeleteTarget(null); fetchTemplates(); }
    else { addToast(res.error || 'Delete failed', 'error'); }
    setDeleting(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const errorClass = "text-xs text-rose-500 mt-1";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notification Templates"
        description="Reusable notification message templates"
        actions={
          <button onClick={() => { cancelForm(); setShowForm(true); }}
            className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
            <div className="relative flex items-center gap-2"><Plus className="w-4 h-4" /> New Template</div>
          </button>
        }
      />

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{editingId ? 'Edit Template' : 'New Template'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Template Name *</label>
                <input type="text" {...register('name')} placeholder="e.g. Fee Reminder" className={inputClass} />
                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Type *</label>
                <select {...register('type')} className={inputClass}>
                  <option value="Info">Info</option>
                  <option value="Success">Success</option>
                  <option value="Warning">Warning</option>
                  <option value="Error">Error</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Target *</label>
                <select {...register('target')} className={inputClass}>
                  <option value="All">All</option>
                  <option value="Student">Student</option>
                  <option value="Warden">Warden</option>
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Default Title *</label>
                <input type="text" {...register('title')} placeholder="e.g. Fee Due Reminder" className={inputClass} />
                {errors.title && <p className={errorClass}>{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Channel *</label>
                <select {...register('deliveryChannel')} className={inputClass}>
                  <option value="In-App">In-App</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Message Template *</label>
              <textarea {...register('message')} rows={4} className={inputClass} placeholder="Use {placeholder} for dynamic values..." />
              {errors.message && <p className={errorClass}>{errors.message.message}</p>}
            </div>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={cancelForm}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
      ) : templates.length === 0 ? (
        <EmptyState icon={<FileText className="w-8 h-8" />} title="No templates" description="Create a reusable notification template" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-brand-500/10">
                  <FileText className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Title: {t.title}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t.message}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700">{t.type}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">{t.target}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">{t.deliveryChannel}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Template" message={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" variant="danger" loading={deleting} />
    </div>
  );
}
