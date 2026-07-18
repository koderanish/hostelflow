import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roleTheme } from '../../theme/roleTheme';
import { User, Lock, LogOut } from 'lucide-react';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const role = user?.role || 'admin';
  const theme = roleTheme[role];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const avatarClass = `bg-gradient-to-r ${theme.avatar}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
      >
        <div className={`w-8 h-8 rounded-full ${avatarClass} flex items-center justify-center text-xs font-bold text-white shadow-md group-hover:scale-105 transition-transform duration-200`}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-300">{user?.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in origin-top-right">
          <div className="relative overflow-hidden p-5">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-500/5 to-transparent" />
            <div className="relative flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${avatarClass} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] mt-1 px-2 py-0.5 rounded-full font-medium capitalize ${theme.activeSidebarLight}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <button onClick={() => { navigate(`/${user?.role}/profile`); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group">
              <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" /> My Profile
            </button>
            <button onClick={() => { navigate(`/${user?.role}/change-password`); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group">
              <Lock className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" /> Change Password
            </button>
            <button onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group">
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
