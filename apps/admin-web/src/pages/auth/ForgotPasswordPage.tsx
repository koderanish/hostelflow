import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../schemas/auth.schema';
import { authService } from '../../services/auth.service';
import { useNotify } from '../../context/NotificationContext';
import { Building2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const { addToast } = useNotify();
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const res = await authService.forgotPassword(data.email);
    if (res.success) {
      setSubmittedEmail(data.email);
      setSent(true);
    } else {
      addToast(res.error || 'Failed to send reset link', 'error');
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
          <p className="text-sm text-white/60 mt-1">Reset your password</p>
        </div>

        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/30 mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Check Your Email</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                We've sent a password reset link to <strong>{submittedEmail}</strong>
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Forgot Password</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enter your email to receive reset link</p>
                </div>
              </div>

              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <input id="forgot-email" type="email" {...register('email')} placeholder="Enter your registered email"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
                {errors.email && <p className="mt-1 text-xs text-red-400" role="alert">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="relative w-full overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600 rounded-xl" />
                <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-semibold">
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : 'Send Reset Link'}
                </div>
              </button>

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
