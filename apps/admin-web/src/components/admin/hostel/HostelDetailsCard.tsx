import { Building2, MapPin, Users, User, BedDouble, Calendar, Hash, FileText } from 'lucide-react';
import type { Hostel } from '../../../types';
import { FacilityBadge } from './FacilityBadge';
import { formatDate } from '../../../utils';

interface HostelDetailsCardProps {
  hostel: Hostel;
}

export function HostelDetailsCard({ hostel }: HostelDetailsCardProps) {
  const pct = Math.round((hostel.occupied / hostel.capacity) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-500/5 to-transparent" />
        <div className="relative p-6 flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{hostel.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    hostel.status === 'Active' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${hostel.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {hostel.status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">{hostel.type}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">{hostel.gender}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Details</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{hostel.address}</p><p className="text-xs text-slate-500">Address</p></div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{hostel.wardenName}</p><p className="text-xs text-slate-500">Warden</p></div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Hash className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{hostel.floors} floors &middot; {hostel.buildings} buildings</p><p className="text-xs text-slate-500">Floors &amp; Buildings</p></div>
            </div>
            {hostel.createdAt && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div><p className="text-slate-900 dark:text-white">{formatDate(hostel.createdAt)}</p><p className="text-xs text-slate-500">Created</p></div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Occupancy</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <BedDouble className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{hostel.occupied} / {hostel.capacity}</p><p className="text-xs text-slate-500">Occupied Beds</p></div>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${
                pct > 90 ? 'from-sky-500 to-blue-600' : pct > 70 ? 'from-indigo-500 to-blue-600' : 'from-blue-500 to-indigo-600'
              }`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-slate-500">{pct}% occupancy rate</p>
          </div>

          {hostel.description && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3 text-sm">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                <div><p className="text-slate-900 dark:text-white">{hostel.description}</p><p className="text-xs text-slate-500">Description</p></div>
              </div>
            </div>
          )}

          {hostel.facilities && hostel.facilities.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Facilities</h4>
              <div className="flex flex-wrap gap-1.5">
                {hostel.facilities.map(f => <FacilityBadge key={f} facility={f} />)}
              </div>
            </div>
          )}

          {hostel.images && hostel.images.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Images</h4>
              <div className="flex flex-wrap gap-2">
                {hostel.images.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
