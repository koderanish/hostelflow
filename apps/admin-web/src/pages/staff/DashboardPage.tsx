import { useState, useEffect } from 'react';
import { Sparkles, Wrench, Package, AlertTriangle, Bell, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { roleTheme } from '../../theme/roleTheme';
import { complaintService } from '../../services/complaint.service';
import { inventoryService } from '../../services/inventory.service';
import { notificationService } from '../../services/notification.service';
import type { Complaint, InventoryItem, Notification } from '../../types';

export function StaffDashboardPage() {
  const { user } = useAuth();
  const theme = roleTheme[user?.role || 'staff'];
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      complaintService.getAll(),
      inventoryService.getAll(),
      user ? notificationService.getAll(user.id) : Promise.resolve({ success: true, data: [] }),
    ]).then(([cRes, iRes, nRes]: any[]) => {
      if (cRes.success && cRes.data) setComplaints(cRes.data);
      if (iRes.success && iRes.data) setInventory(iRes.data);
      if (nRes.success && nRes.data) setNotifications(nRes.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const myComplaints = complaints.filter(c => c.assignedToName === user?.name || c.assignedTo === user?.id);
  const assigned = myComplaints.filter(c => c.status === 'Assigned' || c.status === 'In Progress');
  const resolved = myComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed');
  const lowStockItems = inventory.filter(i => i.status === 'Low Stock');
  const recentNotifications = notifications.slice(0, 4);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.hero} p-6 md:p-8`}>
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-amber-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-amber-600/20 to-orange-500/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className={`flex items-center gap-2 ${theme.lightText} text-xs font-medium uppercase tracking-widest mb-2`}>
            <Sparkles className="w-3.5 h-3.5" /> Staff Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-white/60 mt-1">Manage assigned work and track progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Tasks', value: assigned.length, icon: Wrench, sub: `${resolved.length} resolved`, color: 'from-blue-500 to-cyan-600', iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20', iconColor: 'text-blue-500' },
          { label: 'Low Stock Items', value: lowStockItems.length, icon: AlertTriangle, sub: 'needs attention', color: lowStockItems.length > 0 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500', iconBg: lowStockItems.length > 0 ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20', iconColor: lowStockItems.length > 0 ? 'text-amber-500' : 'text-emerald-500' },
          { label: 'Unread Notifications', value: unreadNotifs, icon: Bell, sub: 'updates available', color: unreadNotifs > 0 ? 'from-rose-500 to-pink-500' : 'from-emerald-500 to-teal-500', iconBg: unreadNotifs > 0 ? 'bg-gradient-to-br from-rose-500/20 to-pink-500/20' : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20', iconColor: unreadNotifs > 0 ? 'text-rose-500' : 'text-emerald-500' },
          { label: 'Total Complaints', value: myComplaints.length, icon: CheckCircle2, sub: 'all time', color: 'from-purple-500 to-indigo-500', iconBg: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20', iconColor: 'text-purple-500' },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 card-hover overflow-hidden" style={{ animationDelay: `${idx * 80}ms` }}>
              <div className={`absolute -top-8 -right-8 w-20 h-20 ${s.color} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500 blur-xl`} />
              <div className="relative flex items-start justify-between">
                <div className={`p-3 rounded-xl ${s.iconBg}`}>
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
              </div>
              <p className="relative text-2xl font-bold text-slate-900 dark:text-white mt-4">{s.value}</p>
              <p className="relative text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}<span className="text-slate-400 ml-1">· {s.sub}</span></p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Wrench className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Assigned Complaints</h3>
              {assigned.length > 0 && <span className="px-1.5 py-0.5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400 rounded text-[10px] font-medium">{assigned.length} active</span>}
            </div>
          </div>
          <div className="p-5">
            {assigned.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 dark:text-slate-500">No assigned tasks</p>
              </div>
            ) : (
              <div className="space-y-2">
                {assigned.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-xs font-bold text-blue-700">{c.studentName?.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{c.studentName} · {c.roomNo}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.status === 'Assigned' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700' : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700'}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20">
                  <Package className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Status</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'Total', value: inventory.length, color: 'text-slate-600' },
                  { label: 'Low Stock', value: lowStockItems.length, color: 'text-amber-600' },
                  { label: 'Out of Stock', value: inventory.filter(i => i.status === 'Out of Stock').length, color: 'text-rose-600' },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 rounded-lg bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
              {lowStockItems.length > 0 && (
                <div className="space-y-1">
                  {lowStockItems.slice(0, 3).map(i => (
                    <div key={i.id} className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                      <p className="text-xs font-medium text-slate-900 dark:text-white">{i.name}</p>
                      <span className="text-xs text-amber-600 font-medium">{i.availableQuantity}/{i.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Notifications</h3>
                {unreadNotifs > 0 && <span className="px-1.5 py-0.5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400 rounded text-[10px] font-medium">{unreadNotifs} new</span>}
              </div>
            </div>
            <div className="p-5">
              {recentNotifications.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">No notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentNotifications.map(n => (
                    <div key={n.id} className={`p-3 rounded-xl ${n.read ? 'bg-gradient-to-br from-slate-500/10 to-slate-400/10' : 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
