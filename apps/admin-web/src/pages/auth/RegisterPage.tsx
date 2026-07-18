import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../../schemas/auth.schema';
import { authService } from '../../services/auth.service';
import { useNotify } from '../../context/NotificationContext';
import { Building2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'student' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const res = await authService.register({ ...data, role: data.role || 'student' });
    if (res.success) {
      addToast('Registration successful! You can now login.', 'success');
      navigate('/login');
    } else {
      addToast(res.error || 'Registration failed', 'error');
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
          <p className="text-sm text-white/60 mt-1">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-strong rounded-2xl p-8 space-y-4 shadow-2xl" noValidate>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Register</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Create your account</p>
            </div>
          </div>

          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
            <input id="reg-name" type="text" {...register('name')} placeholder="Enter your full name"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
            {errors.name && <p className="mt-1 text-xs text-red-400" role="alert">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
            <input id="reg-email" type="email" {...register('email')} placeholder="Enter your email"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
            {errors.email && <p className="mt-1 text-xs text-red-400" role="alert">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
            <input id="reg-phone" type="tel" {...register('phone')} placeholder="10-digit phone number"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
            {errors.phone && <p className="mt-1 text-xs text-red-400" role="alert">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
            <select id="reg-role" {...register('role')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50">
              <option value="student">Student</option>
              <option value="warden">Warden</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input id="reg-password" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Min 6 characters"
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400" role="alert">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
            <input id="reg-confirm" type="password" {...register('confirmPassword')} placeholder="Confirm your password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-400" role="alert">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="relative w-full overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600 rounded-xl" />
            <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-semibold">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering...
                </div>
              ) : (
                <><UserPlus className="w-4 h-4" /> Register</>
              )}
            </div>
          </button>

          <div className="text-center">
            <span className="text-xs text-slate-400">Already have an account? </span>
            <Link to="/login" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
