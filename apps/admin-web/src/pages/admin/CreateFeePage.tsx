import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { feeService } from '../../services/fee.service';
import { studentService } from '../../services/student.service';
import { allocationService } from '../../services/allocation.service';
import type { Student, RoomAllocation } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Search } from 'lucide-react';

const feeSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  feeType: z.string().min(1, 'Fee type is required'),
  amount: z.string().min(1, 'Amount is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  period: z.string().optional(),
  allocationId: z.string().optional(),
  remarks: z.string().optional(),
});

type FeeFormData = z.infer<typeof feeSchema>;

export function CreateFeePage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [students, setStudents] = useState<Student[]>([]);
  const [activeAllocs, setActiveAllocs] = useState<RoomAllocation[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FeeFormData>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      dueDate: new Date().toISOString().split('T')[0],
    },
  });

  const studentId = watch('studentId');

  useEffect(() => {
    studentService.getAll().then(res => {
      if (res.success && res.data) setStudents(res.data.filter(s => !s.isDeleted));
    });
    allocationService.getActive().then(res => {
      if (Array.isArray(res)) setActiveAllocs(res.filter(a => !a.isDeleted));
    });
  }, []);

  useEffect(() => {
    if (studentId) {
      const allocs = activeAllocs.filter(a => a.studentId === studentId);
      if (allocs.length === 1) {
        setValue('allocationId', allocs[0].id);
      }
    }
  }, [studentId]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setValue('studentId', student.id);
    setShowStudentPicker(false);
    setStudentSearch('');
  };

  const onSubmit = async (data: FeeFormData) => {
    if (!selectedStudent) {
      addToast('Please select a student', 'error');
      return;
    }
    setSubmitting(true);
    const res = await feeService.createFee({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      feeType: data.feeType as any,
      amount: Number(data.amount),
      dueDate: data.dueDate,
      allocationId: data.allocationId || undefined,
      period: data.period || undefined,
      remarks: data.remarks || undefined,
    });
    if (res.success) {
      addToast('Fee created successfully', 'success');
      navigate('/admin/fees');
    } else {
      addToast((res as any).error || 'Failed to create fee', 'error');
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const errorClass = "text-xs text-rose-500 mt-1";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Create Fee" description="Add a new fee record" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <label className={labelClass}>Student *</label>
            {selectedStudent ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedStudent.name}</p>
                    <p className="text-[10px] text-slate-500">{selectedStudent.enrollmentNo}</p>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedStudent(null); setValue('studentId', ''); }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium">Change</button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={studentSearch} onChange={e => { setStudentSearch(e.target.value); setShowStudentPicker(true); }}
                  onFocus={() => setShowStudentPicker(true)} placeholder="Search for a student..." className={inputClass + " pl-10"} />
                {showStudentPicker && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <p className="p-3 text-xs text-slate-400">No students found</p>
                    ) : filteredStudents.map(s => (
                      <button key={s.id} type="button" onClick={() => selectStudent(s)}
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
            )}
            {errors.studentId && <p className={errorClass}>{errors.studentId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}>Fee Type *</label>
              <select {...register('feeType')} className={inputClass}>
                <option value="">Select type</option>
                <option value="Hostel Fee">Hostel Fee</option>
                <option value="Mess Fee">Mess Fee</option>
                <option value="Security Deposit">Security Deposit</option>
                <option value="Maintenance Charges">Maintenance Charges</option>
              </select>
              {errors.feeType && <p className={errorClass}>{errors.feeType.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Amount (₹) *</label>
              <input type="number" min={0} {...register('amount')} placeholder="e.g. 12000" className={inputClass} />
              {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Due Date *</label>
              <input type="date" {...register('dueDate')} className={inputClass} />
              {errors.dueDate && <p className={errorClass}>{errors.dueDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Billing Period</label>
              <input type="text" {...register('period')} placeholder="e.g. 2024-25 Sem 1" className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Remarks</label>
            <textarea {...register('remarks')} rows={2} className={inputClass} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => navigate('/admin/fees')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Fee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
