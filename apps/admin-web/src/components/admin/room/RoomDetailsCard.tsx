import { DoorOpen, MapPin, Layers, BedDouble, Calendar, Hash, IndianRupee, User } from 'lucide-react';
import type { Room, Bed } from '../../../types';
import { formatDate, formatCurrency, getStatusColor } from '../../../utils';
import { INITIAL_STUDENTS } from '../../../data';

interface RoomDetailsCardProps {
  room: Room;
  hostelName: string;
  buildingName: string;
  beds: Bed[];
}

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

function getStudentName(studentId?: string): string {
  if (!studentId) return '—';
  const s = INITIAL_STUDENTS.find(st => st.id === studentId);
  return s?.name || studentId;
}

export function RoomDetailsCard({ room, hostelName, buildingName, beds }: RoomDetailsCardProps) {
  const capacity = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied' || !!b.studentId).length;
  const pct = capacity > 0 ? Math.round((occupiedBeds / capacity) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-600/5" />
        <div className="relative p-6 flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-600/10 flex items-center justify-center shrink-0">
            <DoorOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Room {room.roomNo}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[room.status] || 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${dotColors[room.status] || 'bg-slate-500'}`} />
                    {room.status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">{room.roomType}</span>
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
              <div><p className="text-slate-900 dark:text-white">{hostelName}</p><p className="text-xs text-slate-500">Hostel</p></div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Layers className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{buildingName}</p><p className="text-xs text-slate-500">Building</p></div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Hash className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">Floor {room.floor} &middot; {room.roomType}</p><p className="text-xs text-slate-500">Floor &amp; Type</p></div>
            </div>
            {room.createdAt && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div><p className="text-slate-900 dark:text-white">{formatDate(room.createdAt)}</p><p className="text-xs text-slate-500">Created</p></div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Occupancy &amp; Pricing</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <BedDouble className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{occupiedBeds} / {capacity}</p><p className="text-xs text-slate-500">Occupied Beds</p></div>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${
                pct > 90 ? 'from-sky-500 to-blue-600' : pct > 70 ? 'from-indigo-500 to-blue-600' : 'from-blue-500 to-indigo-600'
              }`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-slate-500">{pct}% occupancy rate</p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 text-sm">
              <IndianRupee className="w-4 h-4 text-slate-400" />
              <div><p className="text-slate-900 dark:text-white">{formatCurrency(room.price)} / month</p><p className="text-xs text-slate-500">Rent</p></div>
            </div>
          </div>

          {room.amenities.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.map(a => (
                  <span key={a} className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Beds in this Room</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 dark:text-slate-400">Bed No</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 dark:text-slate-400">Student</th>
                </tr>
              </thead>
              <tbody>
                {beds.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-slate-400">No beds configured for this room</td>
                  </tr>
                ) : (
                  beds.map((bed, i) => (
                    <tr key={bed.id} className={`${i < beds.length - 1 ? 'border-b border-slate-50 dark:border-slate-800/50' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors`}>
                      <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">{bed.bedNo}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          bed.status === 'Available' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' :
                          bed.status === 'Occupied' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400' :
                          'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            bed.status === 'Available' ? 'bg-emerald-500' :
                            bed.status === 'Occupied' ? 'bg-blue-500' : 'bg-amber-500'
                          }`} />
                          {bed.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">{getStudentName(bed.studentId)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
