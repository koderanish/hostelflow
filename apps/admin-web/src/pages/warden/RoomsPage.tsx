import { useState, useEffect } from 'react';
import { Sparkles, DoorOpen, Home, Users, Bed as BedIcon, Wrench, Search, Eye, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hostelService } from '../../services/hostel.service';
import { roomService } from '../../services/room.service';
import { bedService } from '../../services/bed.service';
import { buildingService } from '../../services/building.service';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Room, Hostel, Building, Bed } from '../../types';

export function WardenRoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostel, setHostel] = useState<Hostel | undefined>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomBeds, setRoomBeds] = useState<Bed[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    hostelService.getAll().then(async hRes => {
      if (hRes.success && hRes.data && hRes.data.length > 0) {
        const h = hRes.data[0];
        setHostel(h);
        const [rRes, bRes] = await Promise.all([
          roomService.getByHostel(h.id),
          buildingService.getAll(),
        ]);
        if (rRes.success && rRes.data) setRooms(rRes.data);
        if (bRes.success && bRes.data) setBuildings(bRes.data);
      }
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const filtered = rooms.filter(r =>
    !search || r.roomNo.toLowerCase().includes(search.toLowerCase())
  );

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Under Maintenance').length;

  const handleView = async (r: Room) => {
    setSelectedRoom(r);
    setViewLoading(true);
    const [bRes] = await Promise.all([
      bedService.getByRoom(r.id),
    ]);
    if (bRes.success && bRes.data) setRoomBeds(bRes.data);
    setViewLoading(false);
  };

  const getBuildingName = (buildingId: string) => {
    const b = buildings.find(b => b.id === buildingId);
    return b?.name || buildingId.slice(-6);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Rooms
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Room Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{hostel?.name} · {totalRooms} rooms</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Rooms', value: totalRooms, icon: DoorOpen, color: 'text-slate-600', bg: 'bg-gradient-to-br from-slate-500/10 to-slate-400/10' },
          { label: 'Occupied', value: occupiedRooms, icon: Users, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' },
          { label: 'Available', value: availableRooms, icon: Home, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' },
          { label: 'Maintenance', value: maintenanceRooms, icon: Wrench, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-[10px] text-slate-400 uppercase">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by room number..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Room</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Floor</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Building</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No rooms found</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{r.roomNo}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">Floor {r.floor}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.roomType}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{getBuildingName(r.buildingId)}</td>
                    <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleView(r)} className="flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-700 font-medium">
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selectedRoom} onClose={() => setSelectedRoom(null)} title={`Room ${selectedRoom?.roomNo || ''}`} size="lg">
        {viewLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>
        ) : selectedRoom ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-2xl font-bold text-white">{selectedRoom.roomNo}</div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Room {selectedRoom.roomNo}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{hostel?.name} · Floor {selectedRoom.floor} · {getBuildingName(selectedRoom.buildingId)}</p>
                <StatusBadge status={selectedRoom.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Type', value: selectedRoom.roomType },
                { label: 'Floor', value: `Floor ${selectedRoom.floor}` },
                { label: 'Building', value: getBuildingName(selectedRoom.buildingId) },
                { label: 'Amenities', value: selectedRoom.amenities?.join(', ') || 'None' },
                { label: 'Price', value: `₹${selectedRoom.price?.toLocaleString() || 'N/A'}` },
                { label: 'Room ID', value: selectedRoom.id.slice(-8) },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <p className="text-[10px] text-slate-400 uppercase">{f.label}</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{f.value || '-'}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Beds ({roomBeds.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roomBeds.map(b => (
                  <div key={b.id} className={`p-3 rounded-xl border ${
                    b.status === 'Occupied'
                      ? 'border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-500/20 to-cyan-600/20'
                      : b.status === 'Under Maintenance'
                      ? 'border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-500/20 to-orange-500/20'
                      : 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{b.bedNo}</p>
                      <BedIcon className={`w-3 h-3 ${
                        b.status === 'Occupied' ? 'text-blue-600' :
                        b.status === 'Under Maintenance' ? 'text-amber-600' : 'text-emerald-600'
                      }`} />
                    </div>
                    <p className={`text-[10px] font-medium ${
                      b.status === 'Occupied' ? 'text-blue-600 dark:text-blue-400' :
                      b.status === 'Under Maintenance' ? 'text-amber-600 dark:text-amber-400' :
                      'text-emerald-600 dark:text-emerald-400'
                    }`}>{b.status}</p>
                    {b.studentId && <p className="text-[10px] text-slate-500 mt-0.5">Student: {b.studentId.slice(-6)}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
