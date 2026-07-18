import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messService } from '../../services/mess.service';
import { studentService } from '../../services/student.service';
import type { MessMenu, MealRequest } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { UtensilsCrossed, ClipboardList, Soup, CalendarCheck, Sparkles, ArrowRight } from 'lucide-react';

export function MessPage() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState<MessMenu[]>([]);
  const [requests, setRequests] = useState<MealRequest[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [todayMenu, setTodayMenu] = useState<MessMenu | null>(null);

  useEffect(() => {
    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    Promise.all([
      messService.getAll(),
      messService.getRequests(),
      studentService.getAll(),
    ]).then(([menuRes, reqRes, stuRes]) => {
      if (menuRes.success && menuRes.data) {
        const active = menuRes.data.filter((m: MessMenu) => !m.isDeleted);
        setMenus(active);
        setTodayMenu(active.find((m: MessMenu) => m.day === todayName) || null);
      }
      if (reqRes.success && reqRes.data) setRequests((reqRes.data as MealRequest[]).filter(r => !r.isDeleted));
      if (stuRes.success && stuRes.data) setStudentCount(stuRes.data.filter((s: any) => !s.isDeleted).length);
    });
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const approvedCount = requests.filter(r => r.status === 'Approved').length;

  const cards = [
    {
      label: 'Today\'s Menu', value: todayMenu?.day || 'N/A',
      sub: todayMenu ? `B: ${todayMenu.breakfast} | L: ${todayMenu.lunch}` : 'No menu set',
      icon: Soup, color: 'from-indigo-500 to-blue-600', iconBg: 'bg-gradient-to-br from-indigo-500/20 to-blue-600/20', iconColor: 'text-indigo-600', link: '/admin/mess/meal-plans',
    },
    {
      label: 'Pending Requests', value: pendingRequests.length,
      sub: 'Awaiting approval', icon: ClipboardList, color: 'from-sky-500 to-blue-600', iconBg: 'bg-gradient-to-br from-sky-500/20 to-blue-600/20', iconColor: 'text-sky-600', link: '/admin/mess/requests',
    },
    {
      label: 'Approved Today', value: approvedCount,
      sub: 'Special meal requests', icon: UtensilsCrossed, color: 'from-blue-500 to-indigo-600', iconBg: 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20', iconColor: 'text-blue-600', link: '/admin/mess/requests',
    },
    {
      label: 'Active Students', value: studentCount,
      sub: 'Enrolled in mess', icon: CalendarCheck, color: 'from-blue-500 to-cyan-600', iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20', iconColor: 'text-blue-600', link: '/admin/mess/attendance',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Mess Dashboard"
        description="Manage meal plans, attendance, and special requests"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/mess/meal-plans')}
              className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2"><Soup className="w-4 h-4" /> Meal Plans</div>
            </button>
            <button onClick={() => navigate('/admin/mess/attendance')}
              className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2"><CalendarCheck className="w-4 h-4" /> Attendance</div>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button key={s.label} onClick={() => navigate(s.link)}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 card-hover overflow-hidden text-left" style={{ animationDelay: `${idx * 80}ms` }}>
              <div className={`absolute -top-8 -right-8 w-20 h-20 ${s.color} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500 blur-xl`} />
              <div className="relative flex items-start justify-between">
                <div className={`p-3 rounded-xl ${s.iconBg}`}>
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
              </div>
              <p className="relative text-2xl font-bold text-slate-900 dark:text-white mt-4">{s.value}</p>
              <p className="relative text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
              <p className="relative text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{s.sub}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-hidden">
          <div className="relative flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-blue-600/20">
              <Soup className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Menu Overview</h3>
          </div>
          <div className="space-y-1">
            {menus.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className={`text-sm font-medium ${m.day === todayMenu?.day ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {m.day}
                </span>
                <span className="text-xs text-slate-400">{m.breakfast} | {m.lunch}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/admin/mess/meal-plans')}
            className="mt-4 text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
            Manage Meal Plans <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-hidden">
          <div className="relative flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/20">
              <ClipboardList className="w-4 h-4 text-sky-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Requests</h3>
          </div>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.studentName}</p>
                    <p className="text-xs text-slate-500">{r.mealType} · {r.date}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400 font-medium">Pending</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate('/admin/mess/requests')}
            className="mt-4 text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
            Manage Requests <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
