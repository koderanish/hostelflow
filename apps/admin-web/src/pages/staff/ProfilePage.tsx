import { useState, useEffect } from 'react';
import { Sparkles, User, Mail, Phone, Building2, Briefcase, Calendar, Shield, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staff.service';
import { notificationService } from '../../services/notification.service';
import type { Staff } from '../../types';

export function StaffProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Staff | undefined>();
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    staffService.getByField('email' as any, user.email).then((res: any) => {
      if (res.success && res.data && res.data.length > 0) {
        setProfile(res.data[0]);
      }
      setLoading(false);
    });
    notificationService.getUnreadCount(user.id).then(setUnreadCount);
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-48 animate-pulse" />
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Profile
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-medium">
          <Edit3 className="w-3.5 h-3.5" /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-amber-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
              {profile?.name?.charAt(0) || user?.name?.charAt(0) || 'S'}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{profile?.name || user?.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.role || 'Staff'}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <div className={`w-2 h-2 rounded-full ${profile?.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {profile?.status || 'Active'}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', value: profile?.name || user?.name, icon: User },
                { label: 'Email', value: user?.email, icon: Mail },
                { label: 'Phone', value: profile?.phone, icon: Phone },
                { label: 'Department', value: profile?.department, icon: Building2 },
                { label: 'Role', value: profile?.role || 'Staff', icon: Briefcase },
                { label: 'Status', value: profile?.status || 'Active', icon: Shield },
                { label: 'Join Date', value: profile?.joinDate, icon: Calendar },
                { label: 'Staff ID', value: profile?.id?.slice(-8) || '-', icon: User },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <Icon className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{value || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Work Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Notifications', value: unreadCount, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10' },
                { label: 'Department', value: profile?.department || 'General', color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10' },
                { label: 'Joined', value: profile?.joinDate || '-', color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10' },
              ].map(s => (
                <div key={s.label} className={`p-4 rounded-xl ${s.bg}`}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color} mt-1`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
