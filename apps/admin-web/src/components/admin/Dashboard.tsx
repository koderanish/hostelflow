import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { roleTheme } from '../../theme/roleTheme';
import { dashboardService } from '../../services/dashboard.service';
import { noticeService } from '../../services/notice.service';
import { complaintService } from '../../services/complaint.service';
import { hostelService } from '../../services/hostel.service';
import type { Hostel } from '../../types';
import { Building2, Users, DoorOpen, AlertTriangle, Calendar, Megaphone, TrendingUp, DollarSign, Sparkles } from 'lucide-react';

const statCardStyle = (index: number) => {
  const colors = [
    { bg: 'from-blue-500 to-cyan-600', light: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20', icon: 'text-blue-500' },
    { bg: 'from-blue-500 to-indigo-600', light: 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20', icon: 'text-blue-500' },
    { bg: 'from-blue-500 to-cyan-600', light: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20', icon: 'text-blue-500' },
    { bg: 'from-indigo-500 to-blue-600', light: 'bg-gradient-to-br from-indigo-500/20 to-blue-600/20', icon: 'text-indigo-500' },
    { bg: 'from-sky-500 to-blue-600', light: 'bg-gradient-to-br from-sky-500/20 to-blue-600/20', icon: 'text-sky-500' },
    { bg: 'from-blue-500 to-indigo-600', light: 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20', icon: 'text-indigo-500' },
    { bg: 'from-blue-500 to-indigo-600', light: 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20', icon: 'text-indigo-500' },
  ];
  return colors[index % colors.length];
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const theme = roleTheme[user?.role || 'admin'];
  const [stats, setStats] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getAdminStats(),
      noticeService.getAll(),
      hostelService.getAll(),
      complaintService.getAll(),
    ]).then(([statsRes, noticesRes, hostelsRes, complaintsRes]: any[]) => {
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (noticesRes.success && noticesRes.data) setNotices(noticesRes.data);
      if (hostelsRes.success && hostelsRes.data) setHostels(hostelsRes.data);
      if (complaintsRes.success && complaintsRes.data) setComplaints(complaintsRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalStudents = stats?.totalStudents ?? 0;
  const totalHostels = stats?.totalHostels ?? 0;
  const totalRooms = stats?.totalRooms ?? 0;
  const totalCapacity = hostels.reduce((a: number, h: Hostel) => a + h.capacity, 0);
  const totalOccupied = hostels.reduce((a: number, h: Hostel) => a + h.occupied, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const openComplaints = complaints.filter((c: any) => c.status === 'Open' || c.status === 'Assigned' || c.status === 'In Progress').length;
  const pendingLeaves = stats?.pendingLeaves ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;

  const statsCards = [
    { label: 'Total Students', value: totalStudents, icon: Users, suffix: 'enrolled', trend: '+12% this sem' },
    { label: 'Total Hostels', value: totalHostels, icon: Building2, suffix: 'buildings', trend: '2 active wings' },
    { label: 'Total Rooms', value: totalRooms, icon: DoorOpen, suffix: 'rooms', trend: `${stats?.availableRooms ?? 0} available` },
    { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: TrendingUp, suffix: `(${totalOccupied}/${totalCapacity})`, trend: occupancyRate > 85 ? 'High demand' : 'Good' },
    { label: 'Open Complaints', value: openComplaints, icon: AlertTriangle, suffix: 'pending', trend: 'needs attention' },
    { label: 'Pending Leaves', value: pendingLeaves, icon: Calendar, suffix: 'requests', trend: 'awaiting review' },
    { label: 'Revenue', value: `₹${((totalRevenue || 0) / 1000).toFixed(1)}K`, icon: DollarSign, suffix: 'collected', trend: 'this month' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.hero} p-6 md:p-8`}>
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className={`flex items-center gap-2 ${theme.lightText} text-xs font-medium uppercase tracking-widest mb-2`}>
            <Sparkles className="w-3.5 h-3.5" />
            Admin Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Overview</h1>
          <p className="text-sm text-white/60 mt-1">Real-time hostel operations at a glance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {statsCards.map((s, idx) => {
          const Icon = s.icon;
          const colors = statCardStyle(idx);
          return (
            <div
              key={s.label}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 card-hover overflow-hidden"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className={`absolute -top-8 -right-8 w-20 h-20 ${colors.bg} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500 blur-xl`} />
              <div className="relative flex items-start justify-between">
                <div className={`p-3 rounded-xl ${colors.light}`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {s.trend}
                </span>
              </div>
              <div className="relative mt-4">
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{s.suffix}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
              </div>
              <div className="relative mt-4 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full ${colors.bg} transition-all duration-1000`}
                  style={{ width: `${Math.min(100, (idx + 1) * 15)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notices */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-t from-brand-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-blue-600/20">
                <Megaphone className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Notices & Events</h3>
            </div>
            <div className="space-y-3">
              {notices.slice(0, 4).map((n: any) => (
                <div key={n.id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    n.category === 'Event'
                      ? 'bg-gradient-to-br from-indigo-500/20 to-blue-600/20'
                      : 'bg-gradient-to-br from-indigo-500/20 to-blue-600/20'
                  }`}>
                    <Megaphone className={`w-3.5 h-3.5 ${n.category === 'Event' ? 'text-indigo-600' : 'text-indigo-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{n.title}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        n.category === 'Event'
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-400'
                          : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400'
                      }`}>{n.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{n.content}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">{n.date} · {n.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Occupancy */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-600/20">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hostel Occupancy</h3>
            </div>
            <div className="space-y-5">
              {hostels.map((h: Hostel, idx: number) => {
                const pct = Math.round((h.occupied / h.capacity) * 100);
                const barColor = pct > 90 ? 'from-sky-500 to-blue-600' : pct > 70 ? 'from-indigo-500 to-blue-600' : 'from-blue-500 to-indigo-600';
                return (
                  <div key={h.id} style={{ animationDelay: `${idx * 100}ms` }} className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{h.name}</span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{h.occupied}/{h.capacity}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{h.type}</span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{pct}% full</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/20">
              <AlertTriangle className="w-4 h-4 text-sky-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Complaints</h3>
          </div>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                {['Title', 'Student', 'Room', 'Status', 'Priority'].map(h => (
                  <th key={h} className="text-left py-3.5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 5).map((c: any, idx: number) => (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-150 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{c.title}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-[10px] font-bold text-brand-700">
                        {c.studentName.charAt(0)}
                      </div>
                      {c.studentName}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{c.roomNo}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      c.status === 'Resolved' || c.status === 'Closed' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' :
                      c.status === 'In Progress' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400' :
                      c.status === 'Assigned' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400' :
                      'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        c.status === 'Resolved' || c.status === 'Closed' ? 'bg-emerald-500' :
                        c.status === 'In Progress' ? 'bg-blue-500' :
                        c.status === 'Assigned' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      c.priority === 'Critical' ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400' :
                      c.priority === 'High' ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      c.priority === 'Medium' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>{c.priority}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
