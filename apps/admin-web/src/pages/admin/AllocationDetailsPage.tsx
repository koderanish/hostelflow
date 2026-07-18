import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { allocationService } from '../../services/allocation.service';
import { hostelService } from '../../services/hostel.service';
import { buildingService } from '../../services/building.service';
import { roomService } from '../../services/room.service';
import { bedService } from '../../services/bed.service';
import { studentService } from '../../services/student.service';
import type { RoomAllocation, Hostel, Building, Room, Bed } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Edit3, Trash2, ArrowLeft, Clock, History, User, Home, CheckCircle, XCircle, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils';

type Tab = 'overview' | 'transfer' | 'history';

interface AllocEvent {
  id: string;
  allocationId: string;
  eventType: string;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    Created: 'Allocation Created',
    Updated: 'Details Updated',
    StatusChanged: 'Status Changed',
    Allocated: 'Room Allocated',
    Transferred: 'Student Transferred',
    Vacated: 'Room Vacated',
    Cancelled: 'Allocation Cancelled',
  };
  return map[type] || type;
}

function eventColor(type: string): string {
  if (type === 'Created' || type === 'Allocated') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-indigo-600/10';
  if (type === 'Vacated' || type === 'Cancelled') return 'border-sky-400 bg-gradient-to-br from-sky-500/10 to-blue-600/10';
  if (type === 'Transferred') return 'border-indigo-400 bg-gradient-to-br from-indigo-500/10 to-blue-600/10';
  if (type === 'StatusChanged') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-cyan-500/10';
  return 'border-slate-300 bg-slate-50 dark:bg-slate-800/30';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Active: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Transferred: { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    Vacated: { bg: 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 dark:text-slate-400', dot: 'bg-slate-400' },
    Cancelled: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  };
  const c = map[status] || map.Active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

export function AllocationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [alloc, setAlloc] = useState<RoomAllocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [events, setEvents] = useState<AllocEvent[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Transfer state
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [transferHostelId, setTransferHostelId] = useState('');
  const [transferBuildingId, setTransferBuildingId] = useState('');
  const [transferRoomId, setTransferRoomId] = useState('');
  const [transferBedId, setTransferBedId] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showVacateModal, setShowVacateModal] = useState(false);
  const [transferError, setTransferError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      allocationService.getById(id),
      hostelService.getAll(),
      buildingService.getAll(),
    ]).then(([allocRes, hostelRes, buildingRes]) => {
      if (allocRes.success && allocRes.data && !allocRes.data.isDeleted) {
        setAlloc(allocRes.data);
        if (hostelRes.data) setHostels(hostelRes.data.filter(h => !h.isDeleted));
        if (buildingRes.data) setBuildings(buildingRes.data.filter(b => !b.isDeleted));
      } else {
        navigate('/admin/allocations');
      }
      setLoading(false);
    });
    allocationService.getHistory(id).then(res => {
      if (res.success && res.data) setEvents(res.data as AllocEvent[]);
    });
  }, [id, navigate]);

  // Cascading selects for transfer
  useEffect(() => {
    if (transferHostelId) {
      setTransferBuildingId('');
      setTransferRoomId('');
      setTransferBedId('');
      buildingService.getByField('hostelId' as keyof Building, transferHostelId).then(res => {
        if (res.success && res.data) setBuildings(res.data.filter(b => !b.isDeleted));
      });
    }
  }, [transferHostelId]);

  useEffect(() => {
    if (transferBuildingId) {
      setTransferRoomId('');
      setTransferBedId('');
      roomService.getByBuilding(transferBuildingId).then(res => {
        if (res.success && res.data) setRooms(res.data.filter(r => !r.isDeleted && r.status !== 'Under Maintenance'));
      });
    }
  }, [transferBuildingId]);

  useEffect(() => {
    if (transferRoomId) {
      setTransferBedId('');
      bedService.getAvailableByRoom(transferRoomId).then(res => {
        if (res.success && res.data) setBeds(res.data);
      });
    }
  }, [transferRoomId]);

  const handleDelete = async () => {
    if (!alloc) return;
    setDeleting(true);
    const res = await allocationService.softDelete(alloc.id);
    if (res.success) {
      addToast('Allocation deleted successfully', 'success');
      navigate('/admin/allocations');
    } else {
      addToast(res.error || 'Failed to delete allocation', 'error');
    }
    setDeleting(false);
    setShowDelete(false);
  };

  const handleTransfer = async () => {
    if (!alloc) return;
    if (!transferHostelId || !transferBuildingId || !transferRoomId || !transferBedId) {
      setTransferError('Please select hostel, building, room, and bed');
      return;
    }
    setActionLoading(true);
    const hostel = hostels.find(h => h.id === transferHostelId);
    const room = rooms.find(r => r.id === transferRoomId);
    const building = buildings.find(b => b.id === transferBuildingId);
    const bed = beds.find(b => b.id === transferBedId);
    const res = await allocationService.transferAllocation(alloc.id, {
      hostelId: transferHostelId,
      hostelName: hostel?.name || '',
      buildingId: transferBuildingId,
      roomId: transferRoomId,
      roomNo: room?.roomNo || '',
      bedId: transferBedId,
      bedNo: bed?.bedNo,
    });
    if (res.success) {
      addToast('Transfer successful', 'success');
      setShowTransferModal(false);
      // Reload
      const allocRes = await allocationService.getById(alloc.id);
      if (allocRes.success && allocRes.data) setAlloc(allocRes.data);
      const evtRes = await allocationService.getHistory(alloc.id);
      if (evtRes.success && evtRes.data) setEvents(evtRes.data as AllocEvent[]);
    } else {
      setTransferError((res as any).error || 'Transfer failed');
    }
    setActionLoading(false);
  };

  const handleVacate = async () => {
    if (!alloc) return;
    setActionLoading(true);
    const res = await allocationService.vacateAllocation(alloc.id);
    if (res.success) {
      addToast('Allocation vacated successfully', 'success');
      setShowVacateModal(false);
      const allocRes = await allocationService.getById(alloc.id);
      if (allocRes.success && allocRes.data) setAlloc(allocRes.data);
      const evtRes = await allocationService.getHistory(alloc.id);
      if (evtRes.success && evtRes.data) setEvents(evtRes.data as AllocEvent[]);
    } else {
      addToast(res.error || 'Failed to vacate', 'error');
    }
    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (!alloc) return;
    setActionLoading(true);
    const res = await allocationService.cancelAllocation(alloc.id);
    if (res.success) {
      addToast('Allocation cancelled', 'success');
      const allocRes = await allocationService.getById(alloc.id);
      if (allocRes.success && allocRes.data) setAlloc(allocRes.data);
      const evtRes = await allocationService.getHistory(alloc.id);
      if (evtRes.success && evtRes.data) setEvents(evtRes.data as AllocEvent[]);
    } else {
      addToast(res.error || 'Failed to cancel', 'error');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!alloc) return null;

  const merged = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const canTransfer = alloc.status === 'Active';
  const canVacate = alloc.status === 'Active' || alloc.status === 'Transferred';
  const canCancel = alloc.status === 'Active';

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <User className="w-3.5 h-3.5" /> },
    { key: 'transfer', label: 'Transfer', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
    { key: 'history', label: `History (${merged.length})`, icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  const infoRow = (label: string, value: string | undefined) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{value || '-'}</span>
    </div>
  );

  const filteredBuildings = buildings.filter(b => !transferHostelId || b.hostelId === transferHostelId);
  const filteredRooms = rooms.filter(r => !transferBuildingId || r.buildingId === transferBuildingId);
  const filteredBeds = beds.filter(b => !transferRoomId || b.roomId === transferRoomId);
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Allocation - ${alloc.studentName}`}
        description="Room allocation details and management"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/allocations"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            {canTransfer && (
              <button onClick={() => { setTransferError(''); setShowTransferModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                <ArrowRightLeft className="w-4 h-4" /> Transfer
              </button>
            )}
            {canVacate && (
              <button onClick={() => setShowVacateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <XCircle className="w-4 h-4" /> Vacate
              </button>
            )}
            {canCancel && (
              <button onClick={handleCancel} disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/30 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            )}
            <button onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === t.key
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" /> Student Information
            </h3>
            <div className="space-y-0">
              {infoRow('Student Name', alloc.studentName)}
              {infoRow('Application ID', alloc.applicationId)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-brand-500" /> Room Information
            </h3>
            <div className="space-y-0">
              {infoRow('Hostel', alloc.hostelName)}
              {infoRow('Room No', alloc.roomNo)}
              {infoRow('Bed No', alloc.bedNo || alloc.bedId || '-')}
              {infoRow('Status', undefined)}
              <div className="pt-1">
                <StatusBadge status={alloc.status} />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Dates</h3>
            <div className="space-y-0">
              {infoRow('Allocated Date', alloc.dateAllocated ? formatDate(alloc.dateAllocated) : undefined)}
              {infoRow('Expected Vacate Date', alloc.expectedVacateDate ? formatDate(alloc.expectedVacateDate) : undefined)}
              {infoRow('Actual Vacate Date', alloc.dateVacated ? formatDate(alloc.dateVacated) : undefined)}
            </div>
          </div>
          {alloc.transferHistory && alloc.transferHistory.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Transfer History</h3>
              <ul className="space-y-2">
                {alloc.transferHistory.map((note, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <ArrowRightLeft className="w-3 h-3 mt-0.5 text-indigo-500 shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transfer' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-brand-500" /> Transfer to Another Room
          </h3>
          {!canTransfer ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <AlertCircle className="w-10 h-10 mb-3" />
              <p className="text-sm">Only active allocations can be transferred. Current status: {alloc.status}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hostel *</label>
                  <select value={transferHostelId} onChange={e => setTransferHostelId(e.target.value)} className={inputClass}>
                    <option value="">Select hostel</option>
                    {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Building *</label>
                  <select value={transferBuildingId} onChange={e => setTransferBuildingId(e.target.value)} className={inputClass}>
                    <option value="">Select building</option>
                    {filteredBuildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Room *</label>
                  <select value={transferRoomId} onChange={e => setTransferRoomId(e.target.value)} className={inputClass}>
                    <option value="">Select room</option>
                    {filteredRooms.map(r => <option key={r.id} value={r.id}>{r.roomNo} ({r.roomType})</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bed *</label>
                  <select value={transferBedId} onChange={e => setTransferBedId(e.target.value)} className={inputClass}>
                    <option value="">Select bed</option>
                    {filteredBeds.map(b => <option key={b.id} value={b.id}>{b.bedNo}</option>)}
                  </select>
                </div>
              </div>
              {transferError && <p className="text-xs text-rose-500">{transferError}</p>}
              <button onClick={handleTransfer} disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Transfer Now
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          {merged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <History className="w-10 h-10 mb-3" />
              <p className="text-sm">No events recorded yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {merged.map((evt, i) => (
                <div key={evt.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${eventColor(evt.eventType)}`} />
                    {i < merged.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />}
                  </div>
                  <div className="pb-6 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {eventLabel(evt.eventType)}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDateTime(evt.timestamp)}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 space-y-0.5">
                      {evt.previousStatus && evt.newStatus && (
                        <p>{evt.previousStatus} → {evt.newStatus}</p>
                      )}
                      {evt.details && <p>{evt.details}</p>}
                      {evt.performedBy && <p className="text-slate-400">by {evt.performedBy}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transfer Modal */}
      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Allocation" size="md">
        <div className="space-y-4">
          {transferError && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200 dark:border-rose-800">
              <p className="text-xs text-rose-600 dark:text-rose-400">{transferError}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hostel *</label>
              <select value={transferHostelId} onChange={e => setTransferHostelId(e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Building *</label>
              <select value={transferBuildingId} onChange={e => setTransferBuildingId(e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {filteredBuildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Room *</label>
              <select value={transferRoomId} onChange={e => setTransferRoomId(e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {filteredRooms.map(r => <option key={r.id} value={r.id}>{r.roomNo}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bed *</label>
              <select value={transferBedId} onChange={e => setTransferBedId(e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {filteredBeds.map(b => <option key={b.id} value={b.id}>{b.bedNo}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowTransferModal(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleTransfer} disabled={actionLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
              {actionLoading ? 'Processing...' : 'Transfer'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Vacate Confirmation */}
      <ConfirmDialog
        isOpen={showVacateModal}
        onClose={() => setShowVacateModal(false)}
        onConfirm={handleVacate}
        title="Vacate Allocation"
        message="Are you sure you want to vacate this allocation? The bed will be released and the student will no longer have an active allocation."
        confirmLabel="Vacate"
        variant="warning"
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Allocation"
        message="Are you sure you want to delete this allocation record? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
