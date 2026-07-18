import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { roomService } from '../../services/room.service';
import { bedService } from '../../services/bed.service';
import { roomEventService } from '../../services/room-event.service';
import { bedEventService } from '../../services/bed-event.service';
import { hostelService } from '../../services/hostel.service';
import { buildingService } from '../../services/building.service';
import type { Room, Bed, RoomEvent, BedEvent } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { RoomDetailsCard } from '../../components/admin/room/RoomDetailsCard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Edit3, Trash2, ArrowLeft, RefreshCw, Clock, History } from 'lucide-react';

type Tab = 'details' | 'history';

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    Created: 'Room Created',
    StatusChanged: 'Status Changed',
    Allocated: 'Student Allocated',
    Vacated: 'Student Vacated',
    Transferred: 'Student Transferred',
    Reserved: 'Room Reserved',
    ReservationCancelled: 'Reservation Cancelled',
    MaintenanceStarted: 'Maintenance Started',
    MaintenanceCompleted: 'Maintenance Completed',
  };
  return map[type] || type;
}

function eventColor(type: string): string {
  if (type === 'Created' || type === 'Allocated') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-indigo-600/10';
  if (type === 'Vacated' || type === 'ReservationCancelled') return 'border-slate-400 bg-slate-50 dark:bg-slate-800/30';
  if (type === 'StatusChanged') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-cyan-500/10';
  if (type === 'Transferred') return 'border-indigo-400 bg-gradient-to-br from-indigo-500/10 to-blue-600/10';
  if (type.startsWith('Maintenance')) return 'border-sky-400 bg-gradient-to-br from-sky-500/10 to-blue-600/10';
  return 'border-slate-300 bg-slate-50 dark:bg-slate-800/30';
}

export function RoomDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [room, setRoom] = useState<Room | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [hostelName, setHostelName] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [roomEvents, setRoomEvents] = useState<RoomEvent[]>([]);
  const [bedEvents, setBedEvents] = useState<BedEvent[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      roomService.getById(id),
      bedService.getByRoom(id),
      hostelService.getAll(),
      buildingService.getAll(),
      roomEventService.getByRoom(id),
      bedEventService.getByRoom(id),
    ]).then(([roomRes, bedRes, hostelRes, buildingRes, evtRes, bedEvtRes]) => {
      if (roomRes.success && roomRes.data && !roomRes.data.isDeleted) {
        setRoom(roomRes.data);
        setBeds(bedRes.data || []);
        const hName = hostelRes.data?.find(h => h.id === roomRes.data!.hostelId)?.name || 'Unknown';
        const bName = buildingRes.data?.find(b => b.id === roomRes.data!.buildingId)?.name || 'Unknown';
        setHostelName(hName);
        setBuildingName(bName);
        setRoomEvents(evtRes.data || []);
        setBedEvents(bedEvtRes.data || []);
      } else {
        navigate('/admin/rooms');
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!room) return;
    setDeleting(true);
    const res = await roomService.softDelete(room.id);
    if (res.success) {
      addToast('Room deleted successfully', 'success');
      navigate('/admin/rooms');
    } else {
      addToast(res.error || 'Failed to delete room', 'error');
    }
    setDeleting(false);
    setShowDelete(false);
  };

  const handleSync = async () => {
    if (!room) return;
    setSyncing(true);
    const res = await roomService.syncOccupancy(room.id);
    if (res.success) {
      addToast('Room occupancy synced', 'success');
      const evtRes = await roomEventService.getByRoom(room.id);
      if (evtRes.data) setRoomEvents(evtRes.data);
    } else {
      addToast(res.error || 'Sync failed', 'error');
    }
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!room) return null;

  const allEvents: ({ type: 'room' } & RoomEvent)[] = roomEvents.map(e => ({ ...e, type: 'room' as const }));
  const allBedEvts: ({ type: 'bed' } & BedEvent)[] = bedEvents.map(e => ({ ...e, type: 'bed' as const }));
  const merged = [...allEvents, ...allBedEvts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'details', label: 'Details', icon: <ArrowLeft className="w-3.5 h-3.5" /> },
    { key: 'history', label: `History (${merged.length})`, icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Room ${room.roomNo}`}
        description="Room details and bed management"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/rooms"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> Sync
            </button>
            <Link to={`/admin/rooms/${room.id}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
              <Edit3 className="w-4 h-4" /> Edit
            </Link>
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

      {activeTab === 'details' && (
        <RoomDetailsCard room={room} hostelName={hostelName} buildingName={buildingName} beds={beds} />
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
                  <div className={`pb-6 flex-1 ${i === merged.length - 1 ? '' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {eventLabel(evt.eventType)}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatTimestamp(evt.timestamp)}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 space-y-0.5">
                      {evt.type === 'room' ? (
                        <>
                          {evt.previousStatus && evt.newStatus && (
                            <p>{evt.previousStatus} → {evt.newStatus}</p>
                          )}
                          {evt.details && <p>{evt.details}</p>}
                        </>
                      ) : (
                        <>
                          <p>Bed event</p>
                          {evt.studentId && <p>Student: {evt.studentId}</p>}
                          {evt.previousStatus && evt.newStatus && (
                            <p>{evt.previousStatus} → {evt.newStatus}</p>
                          )}
                          {evt.details && <p>{evt.details}</p>}
                        </>
                      )}
                      {evt.performedBy && <p className="text-slate-400">by {evt.performedBy}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete Room "${room.roomNo}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
