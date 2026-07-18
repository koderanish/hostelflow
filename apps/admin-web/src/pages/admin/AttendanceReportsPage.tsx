import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendance.service';
import { studentService } from '../../services/student.service';
import type { Student } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Search, Download, BarChart3, Calendar, User as UserIcon, TrendingUp } from 'lucide-react';

interface ReportData {
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
  records: any[];
}

export function AttendanceReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showStudentPicker, setShowStudentPicker] = useState(false);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(studentSearch.toLowerCase())
  );

  useEffect(() => {
    studentService.getAll().then(res => {
      if (res.success && res.data) {
        setStudents(res.data.filter((s: Student) => !s.isDeleted));
      }
    });
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoadingReport(true);
    const res = await attendanceService.getReport(
      selectedStudent || undefined,
      fromDate || undefined,
      toDate || undefined
    );
    if (res.success && res.data) {
      setReport(res.data);
    }
    setLoadingReport(false);
    setLoading(false);
  };

  const studentName = selectedStudent
    ? students.find(s => s.id === selectedStudent)?.name || 'Selected Student'
    : 'All Students';

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Attendance Reports" description="View attendance statistics and reports" />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <LoadingSkeleton rows={6} />
        </div>
      </div>
    );
  }

  const statCards = report ? [
    { label: 'Present', value: report.present, color: 'from-blue-500 to-indigo-600', bg: 'bg-gradient-to-br from-blue-500/10 to-indigo-600/10', textColor: 'text-blue-700 dark:text-blue-300' },
    { label: 'Absent', value: report.absent, color: 'bg-sky-500', bg: 'bg-gradient-to-br from-sky-500/10 to-blue-600/10', textColor: 'text-sky-700 dark:text-sky-300' },
    { label: 'Late', value: report.late, color: 'from-indigo-500 to-blue-600', bg: 'bg-gradient-to-br from-indigo-500/10 to-blue-600/10', textColor: 'text-indigo-700 dark:text-indigo-300' },
    { label: 'Leave', value: report.leave, color: 'from-blue-500 to-indigo-600', bg: 'bg-gradient-to-br from-blue-500/10 to-indigo-600/10', textColor: 'text-indigo-700 dark:text-indigo-300' },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Attendance Reports"
        description="View attendance statistics and generate reports"
        actions={
          <button onClick={() => {
            if (!report) return;
            const csv = [
              ['Metric', 'Value'],
              ['Total Records', report.total],
              ['Present', report.present],
              ['Absent', report.absent],
              ['Late', report.late],
              ['Leave', report.leave],
              ['Attendance %', `${report.percentage}%`],
            ].map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'attendance-report.csv'; a.click();
            URL.revokeObjectURL(url);
          }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Student</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={selectedStudent ? studentName : studentSearch}
                onChange={e => { setStudentSearch(e.target.value); setSelectedStudent(''); setShowStudentPicker(true); }}
                onFocus={() => setShowStudentPicker(true)}
                onBlur={() => setTimeout(() => setShowStudentPicker(false), 200)}
                placeholder="All Students"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
              {showStudentPicker && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  <button key="all" type="button" onMouseDown={() => { setSelectedStudent(''); setStudentSearch(''); setShowStudentPicker(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                    <span className="text-sm text-slate-600 dark:text-slate-300">All Students</span>
                  </button>
                  {filteredStudents.length === 0 && studentSearch && (
                    <p className="p-3 text-xs text-slate-400">No students found</p>
                  )}
                  {filteredStudents.map(s => (
                    <button key={s.id} type="button" onMouseDown={() => { setSelectedStudent(s.id); setStudentSearch(''); setShowStudentPicker(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">{s.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                        <p className="text-[10px] text-slate-500">{s.enrollmentNo}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50" />
          </div>
          <button onClick={fetchReport} disabled={loadingReport}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Generate
          </button>
        </div>
      </div>

      {loadingReport ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <LoadingSkeleton rows={4} />
        </div>
      ) : report ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statCards.map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Overall stats card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" /> Attendance Summary
            </h3>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-500">Total Records</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{report.total}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-500">Attendance Rate</div>
                <div className={`text-lg font-bold ${report.percentage >= 75 ? 'text-blue-600' : report.percentage >= 50 ? 'text-indigo-600' : 'text-sky-600'}`}>
                  {report.percentage}%
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    report.percentage >= 75 ? 'bg-blue-500' : report.percentage >= 50 ? 'bg-indigo-500' : 'bg-sky-500'
                  }`} style={{ width: `${report.percentage}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Student-specific report */}
          {selectedStudent && report.records.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Daily Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                      <th className="text-left py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                      <th className="text-left py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Check In</th>
                      <th className="text-left py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Check Out</th>
                      <th className="text-left py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                      <th className="text-left py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.records.map((r: any, idx: number) => (
                      <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-5 text-sm text-slate-900 dark:text-white">{r.date}</td>
                        <td className="py-3 px-5 text-xs text-slate-600 dark:text-slate-300">{r.checkInTime || '-'}</td>
                        <td className="py-3 px-5 text-xs text-slate-600 dark:text-slate-300">{r.checkOutTime || '-'}</td>
                        <td className="py-3 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            r.status === 'Present' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' :
                            r.status === 'Late' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400' :
                            r.status === 'Leave' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-400' :
                            'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              r.status === 'Present' ? 'bg-emerald-500' : r.status === 'Late' ? 'bg-amber-500' : r.status === 'Leave' ? 'bg-purple-500' : 'bg-rose-500'
                            }`} />
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-xs text-slate-500 dark:text-slate-400">{r.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Select filters and click Generate to view report</p>
        </div>
      )}
    </div>
  );
}
