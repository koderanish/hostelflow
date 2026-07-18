import { useState, useEffect } from 'react';
import { messService } from '../../services/mess.service';
import { studentService } from '../../services/student.service';
import type { MealAttendance, MealRequest } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Loader2, BarChart3, CalendarDays, UtensilsCrossed, ClipboardCheck, History } from 'lucide-react';
import { formatDateTime } from '../../utils';

interface MessEvent {
  id: string;
  entityType: string;
  entityId: string;
  eventType: string;
  timestamp: string;
  details?: string;
}

export function MealReportsPage() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<MealAttendance[]>([]);
  const [requests, setRequests] = useState<MealRequest[]>([]);
  const [events, setEvents] = useState<MessEvent[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportTab, setReportTab] = useState<'attendance' | 'requests' | 'history'>('attendance');

  useEffect(() => {
    Promise.all([
      messService.getAttendance(),
      messService.getRequests(),
      messService.getHistory(),
      studentService.getAll(),
    ]).then(([attRes, reqRes, evtRes, stuRes]) => {
      if (attRes.success && attRes.data) setAttendance(attRes.data);
      if (reqRes.success && reqRes.data) setRequests((reqRes.data as MealRequest[]).filter(r => !r.isDeleted));
      if (evtRes.success && evtRes.data) setEvents(evtRes.data as MessEvent[]);
      if (stuRes.success && stuRes.data) setStudentCount(stuRes.data.filter((s: any) => !s.isDeleted).length);
      setLoading(false);
    });
  }, []);

  const totalMarked = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;
  const excusedCount = attendance.filter(a => a.status === 'Excused').length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const approvedRequests = requests.filter(r => r.status === 'Approved').length;
  const rejectedRequests = requests.filter(r => r.status === 'Rejected').length;

  const mealBreakdown = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(mt => {
    const mealRecords = attendance.filter(a => a.mealType === mt);
    return {
      meal: mt,
      total: mealRecords.length,
      present: mealRecords.filter(a => a.status === 'Present').length,
      absent: mealRecords.filter(a => a.status === 'Absent').length,
      excused: mealRecords.filter(a => a.status === 'Excused').length,
    };
  });

  const dayAttendance = attendance.filter(a => a.date === selectedDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Meal Reports" description="Attendance analytics and history" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Marked', value: totalMarked, icon: ClipboardCheck, iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20', iconColor: 'text-blue-600' },
          { label: 'Present', value: presentCount, icon: UtensilsCrossed, iconBg: 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20', iconColor: 'text-blue-600' },
          { label: 'Absent', value: absentCount, icon: CalendarDays, iconBg: 'bg-gradient-to-br from-sky-500/20 to-blue-600/20', iconColor: 'text-sky-600' },
          { label: 'Excused', value: excusedCount, icon: BarChart3, iconBg: 'bg-gradient-to-br from-indigo-500/20 to-blue-600/20', iconColor: 'text-indigo-600' },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${s.iconBg}`}>
                  <Icon className={`w-4 h-4 ${s.iconColor}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Attendance by Meal Type</h3>
          <div className="space-y-3">
            {mealBreakdown.map(mb => (
              <div key={mb.meal}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{mb.meal}</span>
                  <span className="text-slate-500">{mb.total} entries</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {mb.total > 0 && (
                    <>
                      <div className="bg-emerald-500 transition-all" style={{ width: `${(mb.present / mb.total) * 100}%` }} />
                      <div className="bg-rose-400 transition-all" style={{ width: `${(mb.absent / mb.total) * 100}%` }} />
                      <div className="bg-amber-400 transition-all" style={{ width: `${(mb.excused / mb.total) * 100}%` }} />
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> {(mb.present / (mb.total || 1) * 100).toFixed(0)}% Present</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-400" /> {(mb.absent / (mb.total || 1) * 100).toFixed(0)}% Absent</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /> {(mb.excused / (mb.total || 1) * 100).toFixed(0)}% Excused</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Request Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Pending</span>
              <span className="text-sm font-bold text-indigo-600">{pendingRequests}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Approved</span>
              <span className="text-sm font-bold text-blue-600">{approvedRequests}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Rejected</span>
              <span className="text-sm font-bold text-sky-600">{rejectedRequests}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500">Total Students</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{studentCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {(['attendance', 'requests', 'history'] as const).map(tab => (
          <button key={tab} onClick={() => setReportTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
              reportTab === tab
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            {tab === 'attendance' && <CalendarDays className="w-3.5 h-3.5 inline mr-1.5" />}
            {tab === 'requests' && <ClipboardCheck className="w-3.5 h-3.5 inline mr-1.5" />}
            {tab === 'history' && <History className="w-3.5 h-3.5 inline mr-1.5" />}
            {tab}
          </button>
        ))}
      </div>

      {reportTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Day-wise Attendance</h3>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
          </div>
          {dayAttendance.length === 0 ? (
            <p className="text-sm text-slate-400">No attendance records for this date.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase text-slate-400">Student</th>
                    <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase text-slate-400">Meal</th>
                    <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dayAttendance.map(a => (
                    <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2.5 px-4 text-xs text-slate-900 dark:text-white">{a.studentName}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{a.mealType}</td>
                      <td className="py-2.5 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          a.status === 'Present' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' :
                          a.status === 'Absent' ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400' :
                          'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400'
                        }`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {reportTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Request History</h3>
          {requests.length === 0 ? (
            <p className="text-sm text-slate-400">No requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase text-slate-400">Student</th>
                    <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase text-slate-400">Meal</th>
                    <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase text-slate-400">Date</th>
                    <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2.5 px-4 text-xs text-slate-900 dark:text-white">{r.studentName}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{r.mealType}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{r.date}</td>
                      <td className="py-2.5 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.status === 'Approved' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700' :
                          r.status === 'Rejected' ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700' :
                          'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {reportTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-brand-500" /> Activity Timeline
          </h3>
          {events.length === 0 ? (
            <p className="text-sm text-slate-400">No activity recorded yet.</p>
          ) : (
            <div className="space-y-0">
              {events.slice(0, 50).map((evt, i) => (
                <div key={evt.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      evt.eventType === 'Created' || evt.eventType === 'Approved' ? 'border-emerald-400 bg-emerald-50' :
                      evt.eventType === 'Rejected' || evt.eventType === 'Deleted' ? 'border-rose-400 bg-rose-50' :
                      'border-blue-400 bg-blue-50'
                    }`} />
                    {i < Math.min(events.length - 1, 49) && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-900 dark:text-white">{evt.eventType}</span>
                      <span className="text-[10px] text-slate-400">{evt.timestamp ? formatDateTime(evt.timestamp) : ''}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{evt.details}</p>
                    <p className="text-[10px] text-slate-400">{evt.entityType}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
