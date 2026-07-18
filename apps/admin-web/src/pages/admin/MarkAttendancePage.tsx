import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { attendanceService } from '../../services/attendance.service';
import { studentService } from '../../services/student.service';
import { leaveService } from '../../services/leave.service';
import type { Student, Attendance } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Save, Calendar } from 'lucide-react';

export function MarkAttendancePage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const [students, setStudents] = useState<Student[]>([]);
  const [existingRecords, setExistingRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance form state: map of studentId -> { status, checkInTime, checkOutTime, remarks }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, {
    status: 'Present' | 'Absent' | 'Late' | 'Leave';
    checkInTime: string;
    checkOutTime: string;
    remarks: string;
  }>>({});

  // Pre-set for edit mode
  const [editRecord, setEditRecord] = useState<Attendance | null>(null);

  useEffect(() => {
    Promise.all([
      studentService.getAll(),
      attendanceService.getAll(),
      leaveService.getAll(),
    ]).then(([stuRes, attRes, levRes]) => {
      const activeStudents = (stuRes.success ? stuRes.data || [] : []).filter((s: Student) => !s.isDeleted && s.status === 'Active');
      setStudents(activeStudents);

      const allAttendance = (attRes.success ? attRes.data || [] : []).filter((a: Attendance) => !a.isDeleted);

      // If editing, load that record
      if (editId) {
        const rec = allAttendance.find((a: Attendance) => a.id === editId);
        if (rec) {
          setEditRecord(rec);
          setDate(rec.date);
          setAttendanceMap({
            [rec.studentId]: {
              status: rec.status,
              checkInTime: rec.checkInTime || '',
              checkOutTime: rec.checkOutTime || '',
              remarks: rec.remarks || '',
            },
          });
          setExistingRecords(allAttendance);
          setLoading(false);
          return;
        }
      }

      setExistingRecords(allAttendance);

      // Pre-fill: for each student, detect existing attendance for selected date
      const todayRecords = allAttendance.filter((a: Attendance) => a.date === date);
      const map: Record<string, { status: 'Present' | 'Absent' | 'Late' | 'Leave'; checkInTime: string; checkOutTime: string; remarks: string }> = {};

      // Approved leaves
      const approvedLeaves = (levRes.success ? levRes.data || [] : []).filter((l: any) => l.status === 'Approved');

      activeStudents.forEach((s: Student) => {
        const existing = todayRecords.find((a: Attendance) => a.studentId === s.id);
        if (existing) {
          map[s.id] = {
            status: existing.status,
            checkInTime: existing.checkInTime || '',
            checkOutTime: existing.checkOutTime || '',
            remarks: existing.remarks || '',
          };
        } else {
          // Check for approved leave
          const hasLeave = approvedLeaves.some((l: any) =>
            l.studentId === s.id && date >= l.fromDate && date <= l.toDate
          );
          map[s.id] = {
            status: hasLeave ? 'Leave' : 'Present',
            checkInTime: '',
            checkOutTime: '',
            remarks: '',
          };
        }
      });

      setAttendanceMap(map);
      setLoading(false);
    });
  }, [editId]);

  useEffect(() => {
    if (editRecord || loading) return;

    // Rebuild map when date changes
    const todayRecords = existingRecords.filter((a: Attendance) => a.date === date);
    const map: Record<string, { status: 'Present' | 'Absent' | 'Late' | 'Leave'; checkInTime: string; checkOutTime: string; remarks: string }> = {};

    students.forEach((s: Student) => {
      const existing = todayRecords.find((a: Attendance) => a.studentId === s.id);
      if (existing) {
        map[s.id] = {
          status: existing.status,
          checkInTime: existing.checkInTime || '',
          checkOutTime: existing.checkOutTime || '',
          remarks: existing.remarks || '',
        };
      } else {
        map[s.id] = {
          status: 'Present',
          checkInTime: '',
          checkOutTime: '',
          remarks: '',
        };
      }
    });

    setAttendanceMap(map);
  }, [date]);

  const setStudentStatus = (studentId: string, field: string, value: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    if (editRecord) {
      // Single record update
      const data = attendanceMap[editRecord.studentId];
      if (!data) return;
      const res = await attendanceService.updateAttendance(editRecord.id, {
        date,
        checkInTime: data.checkInTime || undefined,
        checkOutTime: data.checkOutTime || undefined,
        status: data.status,
        remarks: data.remarks || undefined,
      });
      if (res.success) {
        addToast('Attendance updated successfully', 'success');
        navigate('/admin/attendance');
      } else {
        addToast((res as any).error || 'Failed to update', 'error');
      }
      setSubmitting(false);
      return;
    }

    // Bulk create/update
    const items = students
      .filter(s => attendanceMap[s.id])
      .map(s => ({
        studentId: s.id,
        studentName: s.name,
        date,
        checkInTime: attendanceMap[s.id].checkInTime || undefined,
        checkOutTime: attendanceMap[s.id].checkOutTime || undefined,
        status: attendanceMap[s.id].status,
        remarks: attendanceMap[s.id].remarks || undefined,
      }));

    const res = await attendanceService.markBulkAttendance(items);
    if (res.success) {
      const data = res.data!;
      addToast(`Attendance saved for ${data.successCount} student${data.successCount !== 1 ? 's' : ''}`, 'success');
      if (data.errorCount > 0) {
        addToast(`${data.errorCount} error${data.errorCount !== 1 ? 's' : ''} occurred`, 'error');
      }
      navigate('/admin/attendance');
    } else {
      addToast((res as any).error || 'Failed to save attendance', 'error');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const statusOptions: { value: Attendance['status']; label: string; color: string }[] = [
    { value: 'Present', label: 'Present', color: 'emerald' },
    { value: 'Absent', label: 'Absent', color: 'rose' },
    { value: 'Late', label: 'Late', color: 'amber' },
    { value: 'Leave', label: 'Leave', color: 'purple' },
  ];

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={editRecord ? 'Edit Attendance' : 'Mark Attendance'}
        description={editRecord ? `Editing attendance for ${editRecord.studentName}` : 'Record daily attendance for all students'}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        {!editRecord && (
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-brand-500" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className={inputClass + " max-w-[200px]"} />
            <span className="text-xs text-slate-400">{students.length} student{students.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {editRecord && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-sm font-bold text-brand-700">
                {editRecord.studentName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{editRecord.studentName}</p>
                <p className="text-xs text-slate-500">{editRecord.date}</p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-[140px]">Status</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-[120px]">Check In</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-[120px]">Check Out</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => {
                const st = attendanceMap[s.id];
                if (!st) return null;
                return (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 15}ms` }}>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</p>
                          <p className="text-[10px] text-slate-400">{s.enrollmentNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {statusOptions.map(opt => (
                          <button key={opt.value} type="button"
                            onClick={() => setStudentStatus(s.id, 'status', opt.value)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                              st.status === opt.value
                                ? `bg-${opt.color}-50 text-${opt.color}-700 dark:bg-${opt.color}-900/30 dark:text-${opt.color}-400 ring-2 ring-${opt.color}-500/50`
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <input type="time" value={st.checkInTime} onChange={e => setStudentStatus(s.id, 'checkInTime', e.target.value)}
                        className={inputClass + " text-center"} />
                    </td>
                    <td className="py-2.5 px-4">
                      <input type="time" value={st.checkOutTime} onChange={e => setStudentStatus(s.id, 'checkOutTime', e.target.value)}
                        className={inputClass + " text-center"} />
                    </td>
                    <td className="py-2.5 px-4">
                      <input type="text" value={st.remarks} onChange={e => setStudentStatus(s.id, 'remarks', e.target.value)}
                        placeholder="Optional" className={inputClass} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
          <button onClick={() => navigate('/admin/attendance')}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editRecord ? 'Update Attendance' : 'Save All'}
          </button>
        </div>
      </div>
    </div>
  );
}
