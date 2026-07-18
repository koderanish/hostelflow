import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { feeService } from '../../services/fee.service';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2 } from 'lucide-react';

const feeSchema = z.object({
  feeType: z.string().min(1, 'Fee type is required'),
  amount: z.string().min(1, 'Amount is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  period: z.string().optional(),
  remarks: z.string().optional(),
});

type FeeFormData = z.infer<typeof feeSchema>;

export function EditFeePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ name: string } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FeeFormData>({
    resolver: zodResolver(feeSchema),
  });

  useEffect(() => {
    if (!id) return;
    feeService.getById(id).then(res => {
      if (res.success && res.data && !res.data.isDeleted) {
        const f = res.data;
        reset({
          feeType: f.feeType,
          amount: String(f.amount),
          dueDate: f.dueDate,
          period: f.period || '',
          remarks: f.remarks || '',
        });
        setStudentInfo({ name: f.studentName });
      } else {
        addToast('Fee record not found', 'error');
        navigate('/admin/fees');
      }
      setLoading(false);
    });
  }, [id]);

  const onSubmit = async (data: FeeFormData) => {
    if (!id) return;
    setSubmitting(true);
    const res = await feeService.updateFee(id, {
      feeType: data.feeType as any,
      amount: Number(data.amount),
      dueDate: data.dueDate,
      period: data.period || undefined,
      remarks: data.remarks || undefined,
    });
    if (res.success) {
      addToast('Fee updated successfully', 'success');
      navigate('/admin/fees');
    } else {
      addToast((res as any).error || 'Failed to update fee', 'error');
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
      <PageHeader title="Edit Fee" description="Update fee record" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {studentInfo && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center text-xs font-bold text-blue-700">
                  {studentInfo.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{studentInfo.name}</p>
                </div>
              </div>
            </div>
          )}

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
              <input type="number" min={0} {...register('amount')} className={inputClass} />
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
              Update Fee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
