import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../schemas/auth.schema';
import { authService } from '../../services/auth.service';
import { useNotify } from '../../context/NotificationContext';
import { Building2, Lock, CheckCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const token = searchParams.get('token') || '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    const res = await authService.resetPassword(token, data.password);
    if (res.success) {
      addToast('Password reset successfully! Redirecting to login...', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      addToast(res.error || 'Reset failed', 'error');
    }
  };

  return (
    <div className="min-h-dvh bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tr from-brand-500/20 to-accent-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="w-full max-w-md relative animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl mb-5 shadow-lg shadow-brand-500/25 animate-bounce-gentle">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">HostelFlow</h1>
          <p className="text-sm text-white/60 mt-1">Set new password</p>
        </div>

        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reset Password</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter your new password</p>
              </div>
            </div>

            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
              <input id="reset-password" type="password" {...register('password')} placeholder="Enter new password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
              {errors.password && <p className="mt-1 text-xs text-red-400" role="alert">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="reset-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
              <input id="reset-confirm" type="password" {...register('confirmPassword')} placeholder="Confirm new password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-400" role="alert">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="relative w-full overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600 rounded-xl" />
              <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-semibold">
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
