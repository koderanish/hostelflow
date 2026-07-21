import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '../../services/room.service';
import { hostelService } from '../../services/hostel.service';
import { buildingService } from '../../services/building.service';
import type { Room, Hostel, Building } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2 } from 'lucide-react';

export function EditRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [hostelId, setHostelId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [floor, setFloor] = useState('1');
  const [roomType, setRoomType] = useState<string>('Single');
  const [amenities, setAmenities] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<string>('Available');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      roomService.getById(id),
      hostelService.getAll(),
      buildingService.getAll(),
    ]).then(([roomRes, hostelRes, buildingRes]) => {
      if (roomRes.success && roomRes.data) {
        const r = roomRes.data;
        setRoom(r);
        navigate(`/admin/rooms/${id}/edit`, { replace: true, state: { name: r.roomNo } });
        setHostelId(r.hostelId);
        setBuildingId(r.buildingId);
        setRoomNo(r.roomNo);
        setFloor(String(r.floor));
        setRoomType(r.roomType);
        setAmenities(r.amenities.join(', '));
        setPrice(String(r.price));
        setStatus(r.status);
        setHostels(hostelRes.data?.filter(h => !h.isDeleted) || []);
        setBuildings(buildingRes.data?.filter(b => !b.isDeleted) || []);
      } else {
        navigate('/admin/rooms');
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const filteredBuildings = buildings.filter(b => !hostelId || b.hostelId === hostelId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !hostelId || !buildingId || !roomNo || !price) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    setSubmitting(true);
    const amenitiesList = amenities.split(',').map(a => a.trim()).filter(Boolean);
    const data: Partial<Room> = {
      hostelId,
      buildingId,
      roomNo,
      floor: Number(floor),
      roomType: roomType as Room['roomType'],
      status: status as Room['status'],
      amenities: amenitiesList,
      price: Number(price),
    };
    const res = await roomService.updateRoom(room.id, data);
    if (res.success) {
      addToast('Room updated successfully', 'success');
      navigate('/admin/rooms');
    } else {
      addToast(res.error || 'Failed to update room', 'error');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Edit: Room ${room.roomNo}`}
        description="Update room details"
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hostel</label>
              <select value={hostelId} onChange={e => setHostelId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
                <option value="">Select a hostel</option>
                {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Building</label>
              <select value={buildingId} onChange={e => setBuildingId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
                <option value="">Select a building</option>
                {filteredBuildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Room No</label>
              <input type="text" value={roomNo} onChange={e => setRoomNo(e.target.value)} placeholder="e.g. A-104"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Floor</label>
              <input type="number" min={0} value={floor} onChange={e => setFloor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Room Type</label>
              <select value={roomType} onChange={e => setRoomType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Dormitory">Dormitory</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Price (₹/month)</label>
              <input type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 12000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amenities (comma separated)</label>
              <input type="text" value={amenities} onChange={e => setAmenities(e.target.value)} placeholder="e.g. Bed, Table, Chair, Fan, AC"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => navigate('/admin/rooms')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
