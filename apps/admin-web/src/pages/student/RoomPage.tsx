import { useState, useEffect } from 'react';
import { Sparkles, DoorOpen, Building2, Bed as BedIcon, Calendar, Users, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services';
import { allocationService } from '../../services/allocation.service';
import { roomService } from '../../services/room.service';
import { bedService } from '../../services/bed.service';
import { hostelService } from '../../services/hostel.service';
import { buildingService } from '../../services/building.service';
import type { Student, RoomAllocation, Room, Bed, Hostel } from '../../types';

interface HistoryEvent { id: string; eventType: string; timestamp: string; details?: string; }

export function StudentRoomPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | undefined>();
  const [allocation, setAllocation] = useState<RoomAllocation | undefined>();
  const [room, setRoom] = useState<Room | undefined>();
  const [hostel, setHostel] = useState<Hostel | undefined>();
  const [beds, setBeds] = useState<Bed[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    studentService.getByUserId(user.id).then(async sRes => {
      if (sRes.success && sRes.data) {
        setProfile(sRes.data);
        const alRes = await allocationService.getByStudent(sRes.data.id);
        if (alRes.success && alRes.data) {
          const active = alRes.data.find(a => a.status === 'Active');
          if (active) {
            setAllocation(active);
            const [rRes, hRes, bRes, evtRes] = await Promise.all([
              roomService.getById(active.roomId),
              hostelService.getById(active.hostelId),
              active.bedId ? bedService.getByRoom(active.roomId) : Promise.resolve({ success: true, data: [] }),
              allocationService.getHistory(active.id),
            ]);
            if (rRes.success && rRes.data) setRoom(rRes.data);
            if (hRes.success && hRes.data) setHostel(hRes.data);
            if (bRes.success && bRes.data) setBeds(bRes.data);
            if (evtRes.success && evtRes.data) setHistory(evtRes.data as HistoryEvent[]);
          }
        }
      }
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  if (!allocation || !room) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Room
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Room Details</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View your room and bed details</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <DoorOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Not Allocated</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">You haven't been assigned a room yet</p>
        </div>
      </div>
    );
  }

  const occupiedBeds = beds.filter(b => b.studentId && b.id !== allocation.bedId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Room
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Room Details</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">View your room and bed details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {room.roomNo}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Room {room.roomNo}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{hostel?.name} · Floor {room.floor}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Room Type', value: room.roomType || 'Standard', icon: Home },
                  { label: 'Floor', value: `Floor ${room.floor}`, icon: Building2 },
                  { label: 'Building', value: allocation.buildingId ? `Building ${allocation.buildingId.slice(-4)}` : 'Main', icon: Building2 },
                  { label: 'Bed Number', value: allocation.bedNo || allocation.bedId || '-', icon: BedIcon },
                  { label: 'Capacity', value: `${beds.length} beds`, icon: Users },
                  { label: 'Allocation Date', value: new Date(allocation.dateAllocated).toLocaleDateString(), icon: Calendar },
                ].map(f => (
                  <div key={f.label} className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <div className="flex items-center gap-2 mb-1">
                      <f.icon className="w-3.5 h-3.5 text-brand-600" />
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{f.label}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {occupiedBeds.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Roommates</h3>
              <div className="space-y-2">
                  {occupiedBeds.map(b => (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-sm font-bold text-brand-700">
                      ?
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Student (ID: {b.studentId?.slice(-6)})</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Bed {b.bedNo || b.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Occupancy</h3>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-slate-900 dark:text-white">{beds.filter(b => b.studentId).length}/{beds.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Beds Occupied</p>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${beds.length > 0 ? (beds.filter(b => b.studentId).length / beds.length) * 100 : 0}%` }} />
            </div>
          </div>

          {history.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Room History</h3>
              <div className="space-y-3">
                {history.map((evt, idx) => (
                  <div key={evt.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${idx === 0 ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      {idx < history.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-xs font-medium text-slate-900 dark:text-white">{evt.eventType}</p>
                      {evt.details && <p className="text-[10px] text-slate-500 dark:text-slate-400">{evt.details}</p>}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(evt.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
