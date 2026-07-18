import { useState, useEffect } from 'react';
import { Sparkles, Bell, CheckCheck, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notification.service';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../../components/ui/ToastContainer';
import type { Notification } from '../../types';

export function StaffNotificationsPage() {
  const { user } = useAuth();
  const { addToast, toasts, removeToast } = useNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    if (!user) return;
    notificationService.getAll(user.id).then((res: any) => {
      if (res.success && res.data) setNotifications(res.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllRead(user.id);
    const res = await notificationService.getAll(user.id);
    if (res.success && res.data) setNotifications(res.data);
    addToast('All notifications marked as read', 'success');
  };

  const handleMarkRead = async (id: string) => {
    await notificationService.markRead(id);
    const res = await notificationService.getAll(user!.id);
    if (res.success && res.data) setNotifications(res.data);
  };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => filter === 'read' ? n.read : !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  const typeColors: Record<string, string> = {
    'Fee Due': 'bg-rose-100 text-rose-700',
    'Room Allocation': 'bg-blue-100 text-blue-700',
    'Complaint Resolved': 'bg-emerald-100 text-emerald-700',
    'Leave Approved': 'bg-emerald-100 text-emerald-700',
    'Leave Rejected': 'bg-rose-100 text-rose-700',
    'General': 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Notifications
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        {(['all', 'unread', 'read'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 dark:text-slate-500">No {filter === 'all' ? '' : filter} notifications</p>
          </div>
        ) : (
          filtered.map(n => (
            <div key={n.id}
              className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700 ${!n.read ? 'ring-1 ring-blue-500/20' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${!n.read ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10' : 'bg-gradient-to-br from-slate-500/10 to-slate-400/10'}`}>
                  <Bell className={`w-4 h-4 ${!n.read ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                      <p className={`text-sm ${!n.read ? 'font-bold' : 'font-medium'} text-slate-900 dark:text-white`}>{n.title}</p>
                    </div>
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)}
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[n.type] || 'bg-slate-100 text-slate-700'}`}>{n.type}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(n.date).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
