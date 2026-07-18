import { useState, useEffect } from 'react';
import { Sparkles, ClipboardCheck, Search, Calendar, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hostelService } from '../../services/hostel.service';
import { studentService } from '../../services/student.service';
import { attendanceService } from '../../services/attendance.service';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Student, Attendance } from '../../types';

export function WardenAttendancePage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'daily' | 'student'>('daily');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentRecords, setStudentRecords] = useState<Attendance[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const hRes = await hostelService.getAll();
    if (hRes.success && hRes.data && hRes.data.length > 0) {
      const sRes = await studentService.getByHostel(hRes.data[0].id);
      if (sRes.success && sRes.data) setStudents(sRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (viewMode === 'daily' && selectedDate) {
      attendanceService.getByDate(selectedDate).then((res: any) => {
        if (res.success && res.data) setRecords(res.data);
      });
    }
  }, [selectedDate, viewMode]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const getStudentAttendance = (studentId: string) => {
    const rec = records.find(r => r.studentId === studentId);
    return rec;
  };

  const handleViewStudent = async (s: Student) => {
    setSelectedStudent(s);
    const aRes = await attendanceService.getByStudent(s.id);
    if (aRes.success && aRes.data) setStudentRecords(aRes.data);
  };

  const studentAttRate = (sid: string) => {
    const sRecs = studentRecords.filter(r => r.studentId === sid);
    const present = sRecs.filter(r => r.status === 'Present').length;
    return sRecs.length > 0 ? Math.round((present / sRecs.length) * 100) : 0;
  };

  const todayPresent = records.filter(r => r.status === 'Present').length;
  const todayAbsent = records.filter(r => r.status === 'Absent').length;
  const todayLate = records.filter(r => r.status === 'Late').length;
  const todayLeave = records.filter(r => r.status === 'Leave').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Attendance
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Attendance Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track daily attendance and student records</p>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setViewMode('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-medium ${viewMode === 'daily' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
          Daily View
        </button>
        <button onClick={() => setViewMode('student')}
          className={`px-4 py-2 rounded-lg text-xs font-medium ${viewMode === 'student' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
          Student View
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: todayPresent, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10' },
          { label: 'Absent', value: todayAbsent, icon: XCircle, color: 'text-red-600', bg: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10' },
          { label: 'Late', value: todayLate, icon: Clock, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10' },
          { label: 'Leave', value: todayLeave, icon: Calendar, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-[10px] text-slate-400 uppercase">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {viewMode === 'daily' && (
        <>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Room</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Check In</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-400">No students found</td></tr>
                  ) : (
                    students.map(s => {
                      const att = getStudentAttendance(s.id);
                      return (
                        <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">{s.name.charAt(0)}</div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.enrollmentNo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.roomNo || '-'}</td>
                          <td className="py-3 px-4">{att ? <StatusBadge status={att.status} /> : <span className="text-xs text-slate-400">No record</span>}</td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{att?.checkInTime || '-'}</td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{att?.checkOutTime || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {viewMode === 'student' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Enrollment</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Room</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center text-sm text-slate-400">No students found</td></tr>
                  ) : (
                    students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase())).map(s => (
                      <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">{s.name.charAt(0)}</div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.enrollmentNo}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.roomNo || '-'}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => handleViewStudent(s)} className="text-[10px] text-brand-600 hover:text-brand-700 font-medium">View Records</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedStudent && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Attendance Rate: {studentAttRate(selectedStudent.id)}%</p>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
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
                    {studentRecords.length === 0 ? (
                      <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-400">No attendance records</td></tr>
                    ) : (
                      studentRecords.map(a => (
                        <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-3 px-4 text-slate-900 dark:text-white">{a.date}</td>
                          <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                          <td className="py-3 px-4 text-slate-500">{a.checkInTime || '-'}</td>
                          <td className="py-3 px-4 text-slate-500">{a.checkOutTime || '-'}</td>
                          <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">{a.remarks || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
