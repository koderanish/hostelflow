import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { notificationMessageService } from '../../services/notification-message.service';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Send } from 'lucide-react';

const notifSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['Info', 'Success', 'Warning', 'Error']),
  target: z.enum(['All', 'Student', 'Warden', 'Staff', 'Admin']),
  recipientId: z.string().optional(),
  deliveryChannel: z.enum(['In-App', 'Email', 'SMS']),
  scheduledTime: z.string().optional(),
});

type NotifFormData = z.infer<typeof notifSchema>;

export function CreateNotificationPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [submitting, setSubmitting] = useState(false);
  const [sendNow, setSendNow] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<NotifFormData>({
    resolver: zodResolver(notifSchema),
    defaultValues: { deliveryChannel: 'In-App' },
  });

  const onSubmit = async (data: NotifFormData) => {
    setSubmitting(true);
    const res = await notificationMessageService.create({
      title: data.title, message: data.message, type: data.type,
      target: data.target, deliveryChannel: data.deliveryChannel,
      recipientId: data.recipientId || undefined,
      scheduledTime: sendNow ? undefined : (data.scheduledTime || undefined),
    });
    if (res.success) {
      if (sendNow) {
        await notificationMessageService.send(res.data!.id);
        addToast('Notification created and sent', 'success');
      } else {
        addToast('Notification created', 'success');
      }
      navigate('/admin/notifications');
    } else {
      addToast(res.error || 'Failed to create notification', 'error');
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const errorClass = "text-xs text-rose-500 mt-1";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Create Notification" description="Compose a new system notification" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}>Title *</label>
              <input type="text" {...register('title')} placeholder="e.g. Fee Due Reminder" className={inputClass} />
              {errors.title && <p className={errorClass}>{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Type *</label>
              <select {...register('type')} className={inputClass}>
                <option value="Info">Info</option>
                <option value="Success">Success</option>
                <option value="Warning">Warning</option>
                <option value="Error">Error</option>
              </select>
              {errors.type && <p className={errorClass}>{errors.type.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Target *</label>
              <select {...register('target')} className={inputClass}>
                <option value="">Select target</option>
                <option value="All">All Users</option>
                <option value="Student">Students</option>
                <option value="Warden">Wardens</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admins</option>
              </select>
              {errors.target && <p className={errorClass}>{errors.target.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Recipient ID</label>
              <input type="text" {...register('recipientId')} placeholder="e.g. s1 (optional)" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Delivery Channel *</label>
              <select {...register('deliveryChannel')} className={inputClass}>
                <option value="In-App">In-App</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
              </select>
              {errors.deliveryChannel && <p className={errorClass}>{errors.deliveryChannel.message}</p>}
            </div>
            {!sendNow && (
              <div className="space-y-1.5">
                <label className={labelClass}>Scheduled Time</label>
                <input type="datetime-local" {...register('scheduledTime')} className={inputClass} />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Message *</label>
            <textarea {...register('message')} rows={5} className={inputClass} placeholder="Type your notification message..." />
            {errors.message && <p className={errorClass}>{errors.message.message}</p>}
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={sendNow} onChange={e => setSendNow(e.target.checked)}
                className="rounded border-slate-300 text-brand-500 focus:ring-brand-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Send immediately</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => navigate('/admin/notifications')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <Send className="w-4 h-4" /> {sendNow ? 'Create & Send' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
