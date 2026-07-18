import { useState, useEffect, useCallback } from 'react';
import { messService } from '../../services/mess.service';
import { studentService } from '../../services/student.service';
import type { MealAttendance, Student } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNotify } from '../../context/NotificationContext';
import { CalendarCheck, Search, Loader2, Check, X, Minus } from 'lucide-react';

export function MealAttendancePage() {
  const { addToast } = useNotify();
  const [records, setRecords] = useState<MealAttendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState<'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>('Breakfast');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [attRes, stuRes] = await Promise.all([
      messService.getAttendance({ date: selectedDate, mealType: selectedMeal }),
      studentService.getAll(),
    ]);
    if (attRes.success && attRes.data) setRecords(attRes.data);
    if (stuRes.success && stuRes.data) setStudents(stuRes.data.filter((s: Student) => !s.isDeleted));
    setLoading(false);
  }, [selectedDate, selectedMeal]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markedStudentIds = new Set(records.map(r => r.studentId));

  const handleMark = async (student: Student, status: MealAttendance['status']) => {
    setSubmitting(true);
    const res = await messService.markAttendance({
      studentId: student.id,
      studentName: student.name,
      date: selectedDate,
      mealType: selectedMeal,
      status,
    });
    if (res.success) {
      addToast(`${student.name} marked ${status}`, 'success');
      fetchData();
    } else {
      addToast(res.error || 'Failed to mark attendance', 'error');
    }
    setSubmitting(false);
  };

  const handleUpdate = async (record: MealAttendance, status: MealAttendance['status']) => {
    setSubmitting(true);
    const res = await messService.updateAttendance(record.id, status);
    if (res.success) {
      addToast('Attendance updated', 'success');
      fetchData();
    } else {
      addToast(res.error || 'Failed to update', 'error');
    }
    setSubmitting(false);
  };

  const mealTypes: MealAttendance['mealType'][] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Meal Attendance" description="Mark daily meal attendance" />

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search students..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
        </div>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
        <div className="flex gap-1">
          {mealTypes.map(mt => (
            <button key={mt} onClick={() => setSelectedMeal(mt)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedMeal === mt
                  ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-md'
                  : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-500/50'
              }`}>
              {mt}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <LoadingSkeleton rows={8} />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                  <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Enrollment</th>
                  <th className="text-center py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-center py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => {
                  const record = records.find(r => r.studentId === student.id);
                  const isMarked = !!record;
                  return (
                    <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-600/20 flex items-center justify-center text-xs font-bold text-indigo-700">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{student.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500">{student.enrollmentNo}</td>
                      <td className="py-3.5 px-5 text-center">
                        {isMarked ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            record.status === 'Present' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' :
                            record.status === 'Absent' ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400' :
                            'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              record.status === 'Present' ? 'bg-emerald-500' : record.status === 'Absent' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            {record.status}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Not marked</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {isMarked ? (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleUpdate(record, 'Present')} disabled={submitting || record.status === 'Present'}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30 transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleUpdate(record, 'Absent')} disabled={submitting || record.status === 'Absent'}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-30 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleUpdate(record, 'Excused')} disabled={submitting || record.status === 'Excused'}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-30 transition-colors">
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleMark(student, 'Present')} disabled={submitting}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Present">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleMark(student, 'Absent')} disabled={submitting}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="Absent">
                              <X className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleMark(student, 'Excused')} disabled={submitting}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Excused">
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="p-8">
              <EmptyState icon={<CalendarCheck className="w-8 h-8" />} title="No students found" description="No active students match your search" />
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        {records.length} / {students.length} students marked for {selectedMeal} on {selectedDate}
      </p>
    </div>
  );
}
