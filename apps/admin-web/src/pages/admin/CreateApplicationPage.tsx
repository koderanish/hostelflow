import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { applicationService } from '../../services/application.service';
import { studentService } from '../../services/student.service';
import { hostelService } from '../../services/hostel.service';
import type { Student, Hostel } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Search } from 'lucide-react';
import { formatDate } from '../../utils';

const applicationSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  preferredHostelId: z.string().min(1, 'Preferred hostel is required'),
  preferredRoomType: z.string().min(1, 'Room type is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  semester: z.string().min(1, 'Semester is required'),
  reason: z.string().optional(),
  specialRequirements: z.string().optional(),
  medicalRequirements: z.string().optional(),
  appliedDate: z.string().min(1, 'Applied date is required'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export function CreateApplicationPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [students, setStudents] = useState<Student[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      appliedDate: formatDate(new Date().toISOString()),
    },
  });

  useEffect(() => {
    studentService.getAll().then(res => {
      if (res.success && res.data) setStudents(res.data.filter(s => !s.isDeleted));
    });
    hostelService.getAll().then(res => {
      if (res.success && res.data) setHostels(res.data.filter(h => !h.isDeleted));
    });
  }, []);

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

  const onSubmit = async (data: ApplicationFormData) => {
    if (!selectedStudent) {
      addToast('Please select a student', 'error');
      return;
    }
    setSubmitting(true);
    const hostel = hostels.find(h => h.id === data.preferredHostelId);
    const res = await applicationService.createApplication({
      ...data,
      studentName: selectedStudent.name,
      course: selectedStudent.course,
      year: selectedStudent.year,
      preferredHostel: hostel?.name || data.preferredHostelId,
    });
    if (res.success) {
      addToast('Application created successfully', 'success');
      navigate('/admin/applications');
    } else {
      addToast(res.error || 'Failed to create application', 'error');
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const errorClass = "text-xs text-rose-500 mt-1";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Create Application" description="Submit a new hostel application" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Student Selection */}
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
                    <p className="text-[10px] text-slate-500">{selectedStudent.enrollmentNo} · {selectedStudent.course}</p>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedStudent(null); setValue('studentId', ''); }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium">Change</button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={studentSearch} onChange={e => { setStudentSearch(e.target.value); setShowStudentPicker(true); }}
                  onFocus={() => setShowStudentPicker(true)}
                  placeholder="Search for a student..."
                  className={inputClass + " pl-10"} />
                {showStudentPicker && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <p className="p-3 text-xs text-slate-400">No students found</p>
                    ) : filteredStudents.map(s => (
                      <button key={s.id} type="button" onClick={() => selectStudent(s)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                          <p className="text-[10px] text-slate-500">{s.enrollmentNo} · {s.course}</p>
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
              <label className={labelClass}>Preferred Hostel *</label>
              <select {...register('preferredHostelId')} className={inputClass}>
                <option value="">Select hostel</option>
                {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              {errors.preferredHostelId && <p className={errorClass}>{errors.preferredHostelId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Preferred Room Type *</label>
              <select {...register('preferredRoomType')} className={inputClass}>
                <option value="">Select room type</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Dormitory">Dormitory</option>
              </select>
              {errors.preferredRoomType && <p className={errorClass}>{errors.preferredRoomType.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Academic Year *</label>
              <select {...register('academicYear')} className={inputClass}>
                <option value="">Select year</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
              {errors.academicYear && <p className={errorClass}>{errors.academicYear.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Semester *</label>
              <select {...register('semester')} className={inputClass}>
                <option value="">Select semester</option>
                <option value="Sem 1">Sem 1</option>
                <option value="Sem 2">Sem 2</option>
                <option value="Sem 3">Sem 3</option>
                <option value="Sem 4">Sem 4</option>
                <option value="Sem 5">Sem 5</option>
                <option value="Sem 6">Sem 6</option>
                <option value="Sem 7">Sem 7</option>
                <option value="Sem 8">Sem 8</option>
              </select>
              {errors.semester && <p className={errorClass}>{errors.semester.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Applied Date *</label>
              <input type="date" {...register('appliedDate')} className={inputClass} />
              {errors.appliedDate && <p className={errorClass}>{errors.appliedDate.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Reason for Application</label>
            <textarea {...register('reason')} rows={2} placeholder="Why does the student need hostel accommodation?" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}>Special Requirements</label>
              <textarea {...register('specialRequirements')} rows={2} placeholder="Any special accommodation needs" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Medical Requirements</label>
              <textarea {...register('medicalRequirements')} rows={2} placeholder="Any medical conditions or needs" className={inputClass} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => navigate('/admin/applications')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
