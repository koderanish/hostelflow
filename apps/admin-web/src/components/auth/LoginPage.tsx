import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../schemas/auth.schema';
import type { LoginFormData } from '../../schemas/auth.schema';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import { roleTheme } from '../../theme/roleTheme';
import { Building2, Eye, EyeOff, LogIn, Shield, Users, GraduationCap } from 'lucide-react';
import { DEMO_ACCOUNTS as DEMO_ACCOUNT_DATA } from '../../constants';

const DEMO_ICONS: Record<string, React.ElementType> = { Admin: Shield, Warden: Users, Staff: Users, Student: GraduationCap };

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useNotify();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.email, data.password, data.rememberMe);
    if (!result.success) {
      addToast(result.error || 'Login failed', 'error');
      return;
    }
    addToast('Login successful! Welcome back.', 'success');
    const redirectMap: Record<string, string> = { admin: '/admin/dashboard', student: '/student/dashboard', warden: '/warden/dashboard', staff: '/staff/dashboard' };
    navigate(redirectMap[result.role || 'admin'] || '/admin/dashboard');
  };

  const fillDemo = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-dvh bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tr from-brand-500/20 to-accent-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-t from-brand-500/5 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="w-full max-w-md relative animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl mb-5 shadow-lg shadow-brand-500/25 animate-bounce-gentle">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">HostelFlow</h1>
          <p className="text-sm text-white/60 mt-1">Hostel Management System</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-strong rounded-2xl p-8 space-y-5 shadow-2xl" noValidate>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Welcome Back</h2>
              <p className="text-xs text-slate-400">Sign in to your account</p>
            </div>
          </div>

          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-brand-500/20 to-accent-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
              <input id="login-email" type="email" {...register('email')} placeholder="Enter your email"
                className="relative w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-200" />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-400" role="alert">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-brand-500/20 to-accent-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
              <input id="login-password" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Enter your password"
                className="relative w-full px-4 py-2.5 pr-12 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-200" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400" role="alert">{errors.password.message}</p>}
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('rememberMe')}
                className="w-4 h-4 rounded border-slate-600 text-brand-600 focus:ring-brand-500" />
              <span className="text-xs text-slate-400">Remember me</span>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting}
            className="relative w-full overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600 rounded-xl opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-semibold">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </div>
          </button>

          <div className="pt-2">
            <p className="text-[10px] text-slate-500 text-center mb-3">Demo Accounts</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {DEMO_ACCOUNT_DATA.map(({ role, email, password }) => {
                const Icon = DEMO_ICONS[role] || Shield;
                const theme = roleTheme[role.toLowerCase() as keyof typeof roleTheme] || roleTheme.admin;
                return (
                  <button key={role} type="button"
                    onClick={() => fillDemo(email, password)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-gradient-to-r ${theme.button} text-white/90 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95`}>
                    <Icon className="w-3 h-3" /> {role}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2">Click a role to fill credentials</p>
          </div>
        </form>
      </div>
    </div>
  );
}
