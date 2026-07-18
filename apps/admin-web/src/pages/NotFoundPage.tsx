import { Link } from 'react-router-dom';
import { Building2, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-dvh bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="text-center relative animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-brand-600 to-accent-600 rounded-3xl mb-6 shadow-lg shadow-brand-500/25">
          <Building2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-8xl font-black text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-white/60 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/admin/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-medium hover:bg-brand-700 transition-all duration-200">
          <Home className="w-4 h-4" /> Go Home
        </Link>
      </div>
    </div>
  );
}
