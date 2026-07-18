import { Link } from 'react-router-dom';
import { Building2, ShieldOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function UnauthorizedPage() {
  const { user } = useAuth();
  const dashboardLink = `/${user?.role}/dashboard`;

  return (
    <div className="min-h-dvh bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="text-center relative animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-600 rounded-3xl mb-6 shadow-lg shadow-rose-500/25">
          <ShieldOff className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-6xl font-black text-white mb-4">403</h1>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-white/60 mb-8 max-w-md">
          You don't have permission to access this page. Contact your administrator if you need access.
        </p>
        <Link to={dashboardLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-medium hover:bg-brand-700 transition-all duration-200">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
