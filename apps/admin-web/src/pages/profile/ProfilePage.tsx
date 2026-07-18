import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '../../schemas/auth.schema';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import { User, Mail, Phone } from 'lucide-react';
import { useEffect } from 'react';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useNotify();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', phone: user?.phone || '' },
  });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email, phone: user.phone });
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    const res = await authService.updateProfile(user.id, data);
    if (res.success && res.data) {
      updateUser(res.data);
      addToast('Profile updated successfully', 'success');
    } else {
      addToast(res.error || 'Failed to update profile', 'error');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="glass-strong rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Profile</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update your personal information</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1" /> Full Name
            </label>
            <input type="text" {...register('name')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Mail className="w-3.5 h-3.5 inline mr-1" /> Email
            </label>
            <input type="email" {...register('email')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Phone className="w-3.5 h-3.5 inline mr-1" /> Phone
            </label>
            <input type="tel" {...register('phone')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
            {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="relative w-full overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600 rounded-xl" />
            <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-semibold">
              {isSubmitting ? 'Saving...' : 'Update Profile'}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
