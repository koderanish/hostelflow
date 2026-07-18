import { useState, useEffect } from 'react';
import { Sparkles, ClipboardCheck, Calendar, CheckCircle2, XCircle, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services';
import { attendanceService } from '../../services/attendance.service';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Student, Attendance } from '../../types';

function getMonthRange(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1).toISOString().split('T')[0];
  const last = new Date(y, m + 1, 0).toISOString().split('T')[0];
  return { first, last, label: date.toLocaleString('default', { month: 'long', year: 'numeric' }) };
}

export function StudentAttendancePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | undefined>();
  const [allRecords, setAllRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!user) return;
    studentService.getByUserId(user.id).then(sRes => {
      if (sRes.success && sRes.data) {
        setProfile(sRes.data);
        return attendanceService.getByStudent(sRes.data.id);
      }
      return Promise.resolve({ success: true, data: [] });
    }).then((aRes: any) => {
      if (aRes.success && aRes.data) setAllRecords(aRes.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const present = allRecords.filter(a => a.status === 'Present').length;
  const absent = allRecords.filter(a => a.status === 'Absent').length;
  const late = allRecords.filter(a => a.status === 'Late').length;
  const leave = allRecords.filter(a => a.status === 'Leave').length;
  const overallRate = allRecords.length > 0 ? Math.round((present / allRecords.length) * 100) : 0;

  const range = getMonthRange(currentMonth);
  const monthRecords = allRecords.filter(a => a.date >= range.first && a.date <= range.last);
  const monthPresent = monthRecords.filter(a => a.status === 'Present').length;
  const monthRate = monthRecords.length > 0 ? Math.round((monthPresent / monthRecords.length) * 100) : 0;

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Attendance
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Attendance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">View your attendance records</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: present, color: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
          { label: 'Absent', value: absent, color: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400', icon: XCircle },
          { label: 'Late', value: late, color: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400', icon: Clock },
          { label: 'Leave', value: leave, color: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400', icon: Calendar },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${s.color.split(' ')[2]}`} />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Overall Attendance</h3>
          <div className="text-center">
            <div className="relative w-36 h-36 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-700" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${overallRate}, 100`} className="text-emerald-500 transition-all duration-1000" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{overallRate}%</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Present</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">{present} out of {allRecords.length} days</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Attendance</h3>
                <span className="text-xs text-slate-500 ml-2">({monthRate}% this month)</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft className="w-4 h-4 text-slate-500" /></button>
                <span className="text-xs text-slate-600 dark:text-slate-400 w-32 text-center font-medium">{range.label}</span>
                <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowRight className="w-4 h-4 text-slate-500" /></button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Check In</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Check Out</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {monthRecords.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-400">No attendance records for this month</td></tr>
                ) : (
                  monthRecords.map(a => (
                    <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{a.date}</td>
                      <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{a.checkInTime || '-'}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{a.checkOutTime || '-'}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{a.remarks || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
