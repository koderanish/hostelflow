import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { notificationMessageService } from '../../services/notification-message.service';
import type { NotificationMessage } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Trash2, ArrowLeft, Bell, Send, History, Clock, User, Target, MailCheck } from 'lucide-react';
import { formatDateTime } from '../../utils';

interface NotifEvent {
  id: string; notificationId: string; eventType: string;
  timestamp: string; performedBy?: string;
  previousStatus?: string; newStatus?: string; details?: string;
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    Info: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700', Success: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700',
    Warning: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700', Error: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700',
  };
  return <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${map[type] || ''}`}>{type}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft: 'bg-slate-100 text-slate-600', Scheduled: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700',
    Sent: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700', Failed: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700',
  };
  return <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${map[status] || ''}`}>{status}</span>;
}

export function NotificationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [notif, setNotif] = useState<NotificationMessage | null>(null);
  const [events, setEvents] = useState<NotifEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      notificationMessageService.getById(id),
      notificationMessageService.getHistory(id),
    ]).then(([nRes, eRes]) => {
      if (nRes.success && nRes.data && !nRes.data.isDeleted) { setNotif(nRes.data); if (eRes.success && eRes.data) setEvents(eRes.data as NotifEvent[]); }
      else navigate('/admin/notifications');
      setLoading(false);
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!notif) return;
    setDeleting(true);
    const res = await notificationMessageService.softDelete(notif.id);
    if (res.success) { addToast('Notification deleted', 'success'); navigate('/admin/notifications'); }
    else { addToast(res.error || 'Delete failed', 'error'); }
    setDeleting(false); setShowDelete(false);
  };

  const handleSend = async () => {
    if (!notif) return;
    setSending(true);
    const res = await notificationMessageService.send(notif.id);
    if (res.success) { addToast('Notification sent', 'success'); const n = await notificationMessageService.getById(notif.id); if (n.success && n.data) setNotif(n.data); const e = await notificationMessageService.getHistory(notif.id); if (e.success && e.data) setEvents(e.data as NotifEvent[]); }
    else { addToast(res.error || 'Send failed', 'error'); }
    setSending(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (!notif) return null;

  const merged = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const infoRow = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={notif.title}
        description="Notification details"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/notifications"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            {(notif.status === 'Draft' || notif.status === 'Scheduled') && (
              <button onClick={handleSend} disabled={sending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-50">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
              </button>
            )}
            {notif.status !== 'Sent' && (
              <button onClick={() => setShowDelete(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-500" /> Details
          </h3>
          <div className="space-y-0">
            {infoRow('Title', notif.title)}
            {infoRow('Type', <TypeBadge type={notif.type} />)}
            {infoRow('Status', <StatusBadge status={notif.status} />)}
            {infoRow('Target', notif.target)}
            {infoRow('Recipient', notif.recipientId || 'All')}
            {infoRow('Channel', notif.deliveryChannel)}
            {infoRow('Read', notif.read ? `Yes ${notif.readBy ? `by ${notif.readBy}` : ''}` : 'No')}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" /> Timeline
          </h3>
          <div className="space-y-0">
            {infoRow('Created', formatDateTime(notif.createdAt))}
            {infoRow('Updated', formatDateTime(notif.updatedAt))}
            {infoRow('Scheduled', notif.scheduledTime ? formatDateTime(notif.scheduledTime) : '-')}
            {infoRow('Sent', notif.sentTime ? formatDateTime(notif.sentTime) : '-')}
            {infoRow('Created By', notif.createdBy)}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Message</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{notif.message}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-brand-500" /> History ({merged.length})
        </h3>
        {merged.length === 0 ? (
          <p className="text-sm text-slate-400">No events recorded</p>
        ) : (
          <div className="space-y-0">
            {merged.map((evt, i) => (
              <div key={evt.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    evt.eventType === 'Sent' ? 'border-emerald-400 bg-emerald-50' :
                    evt.eventType === 'Created' ? 'border-blue-400 bg-blue-50' :
                    'border-slate-300 bg-slate-50'
                  }`} />
                  {i < merged.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-900 dark:text-white">{evt.eventType}</span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(evt.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{evt.details}</p>
                  {evt.performedBy && <p className="text-[10px] text-slate-400">by {evt.performedBy}</p>}
                  {evt.previousStatus && evt.newStatus && <p className="text-[10px] text-slate-500">{evt.previousStatus} → {evt.newStatus}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete Notification" message={`Delete "${notif.title}"?`} confirmLabel="Delete" variant="danger" loading={deleting} />
    </div>
  );
}
