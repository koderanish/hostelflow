import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { applicationService } from '../../services/application.service';
import { hostelService } from '../../services/hostel.service';
import type { Hostel } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2 } from 'lucide-react';

const applicationSchema = z.object({
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

export function EditApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<{ name: string; enrollmentNo: string; course: string } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([
      applicationService.getById(id),
      hostelService.getAll(),
    ]).then(([appRes, hostelRes]) => {
      if (appRes.success && appRes.data && !appRes.data.isDeleted) {
        const a = appRes.data;
        reset({
          preferredHostelId: a.preferredHostelId,
          preferredRoomType: a.preferredRoomType,
          academicYear: a.academicYear,
          semester: a.semester,
          reason: a.reason || '',
          specialRequirements: a.specialRequirements || '',
          medicalRequirements: a.medicalRequirements || '',
          appliedDate: a.appliedDate,
        });
        setStudentInfo({ name: a.studentName, enrollmentNo: a.studentId, course: a.course });
        if (hostelRes.data) setHostels(hostelRes.data.filter(h => !h.isDeleted));
      } else {
        addToast('Application not found', 'error');
        navigate('/admin/applications');
      }
      setLoading(false);
    });
  }, [id]);

  const onSubmit = async (data: ApplicationFormData) => {
    if (!id) return;
    setSubmitting(true);
    const res = await applicationService.updateApplication(id, data);
    if (res.success) {
      addToast('Application updated successfully', 'success');
      navigate('/admin/applications');
    } else {
      addToast(res.error || 'Failed to update application', 'error');
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

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const errorClass = "text-xs text-rose-500 mt-1";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Edit Application" description="Update hostel application details" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {studentInfo && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">
                  {studentInfo.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{studentInfo.name}</p>
                  <p className="text-[10px] text-slate-500">{studentInfo.course}</p>
                </div>
              </div>
            </div>
          )}

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
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={`Sem ${n}`}>Sem {n}</option>)}
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
            <textarea {...register('reason')} rows={2} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}>Special Requirements</label>
              <textarea {...register('specialRequirements')} rows={2} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Medical Requirements</label>
              <textarea {...register('medicalRequirements')} rows={2} className={inputClass} />
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
              Update Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
