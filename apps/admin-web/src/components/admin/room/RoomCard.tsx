import { Link } from 'react-router-dom';
import { DoorOpen, MapPin, Layers, BedDouble, Eye, Edit3, Trash2, IndianRupee } from 'lucide-react';
import type { Room } from '../../../types';
import { formatCurrency } from '../../../utils';

interface RoomCardProps {
  room: Room;
  hostelName: string;
  buildingName: string;
  capacity: number;
  occupiedBeds: number;
  onDelete: (r: Room) => void;
  idx?: number;
}

export function RoomCard({ room, hostelName, buildingName, capacity, occupiedBeds, onDelete, idx = 0 }: RoomCardProps) {
  const pct = capacity > 0 ? Math.round((occupiedBeds / capacity) * 100) : 0;
  const barColor = pct > 90 ? 'from-sky-500 to-blue-600' : pct > 70 ? 'from-indigo-500 to-blue-600' : 'from-blue-500 to-indigo-600';
  const statusColors: Record<string, string> = {
    Available: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
    Occupied: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400',
    'Under Maintenance': 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
    Reserved: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-400',
  };
  const dotColors: Record<string, string> = {
    Available: 'bg-emerald-500', Occupied: 'bg-blue-500',
    'Under Maintenance': 'bg-amber-500', Reserved: 'bg-purple-500',
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 card-hover overflow-hidden" style={{ animationDelay: `${idx * 80}ms` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-blue-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-600/10">
          <DoorOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex items-center gap-1">
          <Link to={`/admin/rooms/${room.id}`}
            className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/admin/rooms/${room.id}/edit`}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
            <Edit3 className="w-4 h-4" />
          </Link>
          <button onClick={() => onDelete(room)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Room {room.roomNo}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${statusColors[room.status] || 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${dotColors[room.status] || 'bg-slate-500'}`} />
              {room.status}
            </span>
          </div>
          <span className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {room.roomType}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-2">
          <MapPin className="w-3 h-3" /> {hostelName}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          <Layers className="w-3 h-3" /> {buildingName} &middot; Floor {room.floor}
        </div>
      </div>
      <div className="relative mt-5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><BedDouble className="w-3 h-3" /> Occupancy</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{occupiedBeds}/{capacity} ({pct}%)</span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor} transition-all duration-1000`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="relative mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <IndianRupee className="w-3 h-3" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(room.price)}</span>/mo
          </div>
          {room.amenities.length > 0 && (
            <span className="text-[10px] text-slate-400 truncate max-w-[140px]" title={room.amenities.join(', ')}>
              {room.amenities.slice(0, 3).join(', ')}{room.amenities.length > 3 ? '...' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
