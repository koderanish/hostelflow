import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notification.service';

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (user) {
      notificationService.getAll(user.id).then(res => {
        if (res.success && res.data) setNotifications(res.data);
      });
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 relative group"
      >
        <Bell className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping" />
            <span className="absolute inset-0 rounded-full bg-red-500" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in origin-top-right">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-500/5 to-transparent" />
            <div className="relative p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 font-medium">
                  {unreadCount} new
                </span>
              </div>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
            ) : notifications.map(n => (
              <div key={n.id}
                className={`relative p-4 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${!n.read ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-500" />}
                <p className={`text-xs font-semibold ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-400">{n.date}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${n.type === 'Fee Due' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : n.type === 'Emergency' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : n.type === 'Complaint Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{n.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
