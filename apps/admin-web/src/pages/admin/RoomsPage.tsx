import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../../services/room.service';
import { bedService } from '../../services/bed.service';
import { hostelService } from '../../services/hostel.service';
import { buildingService } from '../../services/building.service';
import type { Room, Hostel, Building } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Select } from '../../components/ui/Select';
import { RoomCard } from '../../components/admin/room/RoomCard';
import { useNotify } from '../../context/NotificationContext';
import { Plus, Search, SlidersHorizontal, DoorOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export function RoomsPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [rooms, setRooms] = useState<(Room & { capacity: number; occupiedBeds: number; hostelName: string; buildingName: string })[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState<string>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('roomNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 9;

  useEffect(() => {
    hostelService.getAll().then(res => {
      if (res.success && res.data) setHostels(res.data.filter(h => !h.isDeleted));
    });
    buildingService.getAll().then(res => {
      if (res.success && res.data) setBuildings(res.data.filter(b => !b.isDeleted));
    });
  }, []);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (hostelFilter !== 'all') filters.hostelId = hostelFilter;
    if (buildingFilter !== 'all') filters.buildingId = buildingFilter;
    if (statusFilter !== 'all') filters.status = statusFilter;
    const res = await roomService.getPaginated(page, limit, search || undefined, filters, sortBy, sortOrder);
    if (res.success && res.data) {
      const data = res.data.data.filter((r: Room) => !r.isDeleted);
      const hostelMap = new Map(hostels.map(h => [h.id, h.name]));
      const buildingMap = new Map(buildings.map(b => [b.id, b.name]));
      const enriched = data.map((r: Room) => {
        const stats = bedService.computeRoomStats(r.id);
        return {
          ...r,
          capacity: stats.capacity,
          occupiedBeds: stats.occupiedBeds,
          hostelName: hostelMap.get(r.hostelId) || 'Unknown',
          buildingName: buildingMap.get(r.buildingId) || 'Unknown',
        };
      });
      setRooms(enriched);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    }
    setLoading(false);
  }, [page, search, hostelFilter, buildingFilter, statusFilter, sortBy, sortOrder, hostels, buildings]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await roomService.deleteRoom(deleteTarget.id);
    if (res.success) {
      addToast('Room deleted successfully', 'success');
      setDeleteTarget(null);
      fetchRooms();
    } else {
      addToast(res.error || 'Failed to delete room', 'error');
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Rooms"
        description="Manage room inventory and allocation"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/rooms/create')}
              className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Room
              </div>
            </button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search rooms..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
        </div>
        <select value={hostelFilter} onChange={e => { setHostelFilter(e.target.value); setBuildingFilter('all'); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Hostels</option>
          {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <select value={buildingFilter} onChange={e => { setBuildingFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Buildings</option>
          {buildings.filter(b => hostelFilter === 'all' || b.hostelId === hostelFilter).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Status</option>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Reserved">Reserved</option>
        </select>
        <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'roomNo', label: 'Room No' },
              { value: 'floor', label: 'Floor' },
              { value: 'price', label: 'Price' },
            ]}
          />
          <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            className="text-xs text-slate-500 hover:text-brand-500 transition-colors">
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <LoadingSkeleton rows={3} />
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<DoorOpen className="w-8 h-8" />}
          title="No rooms found"
          description={search ? 'Try adjusting your search or filters' : 'Get started by adding your first room'}
          action={
            <button onClick={() => navigate('/admin/rooms/create')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium hover:bg-brand-700 transition-all">
              <Plus className="w-4 h-4 inline mr-1" /> Add Room
            </button>
          }
        />
      ) : (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400">{total} room{total !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((r, i) => (
              <RoomCard key={r.id} room={r} hostelName={r.hostelName} buildingName={r.buildingName}
                capacity={r.capacity} occupiedBeds={r.occupiedBeds} onDelete={setDeleteTarget} idx={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    page === i + 1 ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete Room "${deleteTarget?.roomNo}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
