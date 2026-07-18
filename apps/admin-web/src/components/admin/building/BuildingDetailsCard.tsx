import { useState, useEffect } from 'react';
import { Building2, MapPin, Layers, BedDouble, Users, User, Calendar, Hash, FileText } from 'lucide-react';
import type { Building } from '../../../types';
import { buildingService } from '../../../services/building.service';
import { formatDate } from '../../../utils';

interface BuildingDetailsCardProps {
  building: Building;
}

export function BuildingDetailsCard({ building }: BuildingDetailsCardProps) {
  const [hostelName, setHostelName] = useState('');

  useEffect(() => {
    buildingService.getHostelName(building.hostelId).then(setHostelName);
  }, [building.hostelId]);

  const pct = building.capacity > 0 ? Math.round((building.occupiedRooms / building.capacity) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-500/5 to-transparent" />
        <div className="relative p-6 flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-600/10 flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{building.name}</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{building.code}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    building.status === 'Active' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${building.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {building.status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">{building.gender}</span>
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
              <Building2 className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{hostelName}</p><p className="text-xs text-slate-500">Hostel</p></div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Hash className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{building.code}</p><p className="text-xs text-slate-500">Code</p></div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">Warden (ID: {building.wardenId})</p><p className="text-xs text-slate-500">Assigned Warden</p></div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Layers className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{building.floors} floors</p><p className="text-xs text-slate-500">Floors</p></div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{formatDate(building.createdAt)}</p><p className="text-xs text-slate-500">Created</p></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Occupancy</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <BedDouble className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{building.occupiedRooms} / {building.capacity} rooms</p><p className="text-xs text-slate-500">Occupied / Capacity</p></div>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${
                pct > 90 ? 'from-sky-500 to-blue-600' : pct > 70 ? 'from-indigo-500 to-blue-600' : 'from-blue-500 to-indigo-600'
              }`} style={{ width: `${pct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{building.availableRooms}</p>
                <p className="text-blue-600/70 dark:text-blue-400/70">Available</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{building.occupiedRooms}</p>
                <p className="text-blue-600/70 dark:text-blue-400/70">Occupied</p>
              </div>
            </div>
          </div>

          {building.description && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3 text-sm">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                <div><p className="text-slate-900 dark:text-white">{building.description}</p><p className="text-xs text-slate-500">Description</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
