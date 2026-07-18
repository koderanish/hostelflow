import { Link } from 'react-router-dom';
import { Building2, MapPin, Users, User, BedDouble, Edit3, Trash2, Eye } from 'lucide-react';
import type { Hostel } from '../../../types';

interface HostelCardProps {
  hostel: Hostel;
  onDelete: (h: Hostel) => void;
  idx?: number;
}

export function HostelCard({ hostel, onDelete, idx = 0 }: HostelCardProps) {
  const pct = Math.round((hostel.occupied / hostel.capacity) * 100);
  const barColor = pct > 90 ? 'from-sky-500 to-blue-600' : pct > 70 ? 'from-indigo-500 to-blue-600' : 'from-blue-500 to-indigo-600';

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 card-hover overflow-hidden" style={{ animationDelay: `${idx * 80}ms` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.02] to-accent-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex items-center gap-1">
          <Link to={`/admin/hostels/${hostel.id}`}
            className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/admin/hostels/${hostel.id}/edit`}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
            <Edit3 className="w-4 h-4" />
          </Link>
          <button onClick={() => onDelete(hostel)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{hostel.name}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${
              hostel.status === 'Active' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${hostel.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {hostel.status}
            </span>
          </div>
          <span className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {hostel.type}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-2">
          <MapPin className="w-3 h-3" /> {hostel.address}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          <Users className="w-3 h-3" /> {hostel.gender} &middot; {hostel.floors} floors &middot; {hostel.buildings} buildings
        </div>
      </div>
      <div className="relative mt-5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><BedDouble className="w-3 h-3" /> Occupancy</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{hostel.occupied}/{hostel.capacity} ({pct}%)</span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor} transition-all duration-1000`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="relative mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <User className="w-3 h-3" />
          Warden: <span className="font-medium text-slate-700 dark:text-slate-300">{hostel.wardenName}</span>
        </div>
      </div>
    </div>
  );
}
