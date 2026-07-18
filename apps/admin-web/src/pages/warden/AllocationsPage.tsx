import { useState, useEffect } from 'react';
import { Sparkles, Users, Search, Eye, ArrowRightLeft, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { allocationService } from '../../services/allocation.service';
import { hostelService } from '../../services/hostel.service';
import { roomService } from '../../services/room.service';
import { bedService } from '../../services/bed.service';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../../components/ui/ToastContainer';
import type { RoomAllocation, Room, Bed } from '../../types';

interface HistoryEvent { id: string; eventType: string; timestamp: string; details?: string; }

export function WardenAllocationsPage() {
  const { user } = useAuth();
  const { addToast, toasts, removeToast } = useNotification();
  const [allocations, setAllocations] = useState<RoomAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const [selectedAlloc, setSelectedAlloc] = useState<RoomAllocation | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [vacateTarget, setVacateTarget] = useState<string | null>(null);
  const [showTransfer, setShowTransfer] = useState<RoomAllocation | null>(null);
  const [transferTarget, setTransferTarget] = useState({ roomId: '', bedId: '' });
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [transferBeds, setTransferBeds] = useState<Bed[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const res = await allocationService.getAll();
    if (res.success && res.data) setAllocations(res.data);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const filtered = allocations.filter(a => {
    if (filter === 'active') return a.status === 'Active';
    return true;
  }).filter(a => !search || a.studentName.toLowerCase().includes(search.toLowerCase()) || a.roomNo.toLowerCase().includes(search.toLowerCase()));

  const activeCount = allocations.filter(a => a.status === 'Active').length;

  const handleVacate = async () => {
    if (!vacateTarget) return;
    setProcessing(true);
    const res = await allocationService.vacateAllocation(vacateTarget);
    setProcessing(false);
    if (res.success) {
      addToast('Allocation vacated successfully', 'success');
      setVacateTarget(null);
      loadData();
    } else {
      addToast(res.error || 'Failed to vacate', 'error');
    }
  };

  const loadHistory = async (id: string) => {
    if (selectedAlloc?.id === id) { setSelectedAlloc(null); return; }
    const a = allocations.find(a => a.id === id);
    if (!a) return;
    setSelectedAlloc(a);
    const hRes = await allocationService.getHistory(id);
    if (hRes.success && hRes.data) setHistory(hRes.data as HistoryEvent[]);
  };

  const openTransfer = async (alloc: RoomAllocation) => {
    setShowTransfer(alloc);
    const rRes = await roomService.getAll();
    if (rRes.success && rRes.data) setAvailableRooms(rRes.data.filter(r => r.status !== 'Under Maintenance'));
  };

  const handleRoomSelect = async (roomId: string) => {
    setTransferTarget({ roomId, bedId: '' });
    if (roomId) {
      const bRes = await bedService.getAvailableByRoom(roomId);
      if (bRes.success && bRes.data) setTransferBeds(bRes.data);
    }
  };

  const handleTransfer = async () => {
    if (!showTransfer || !transferTarget.roomId) return;
    setProcessing(true);
    const targetRoom = availableRooms.find(r => r.id === transferTarget.roomId);
    const targetBed = transferBeds.find(b => b.id === transferTarget.bedId);
    const res = await allocationService.transferAllocation(showTransfer.id, {
      roomId: transferTarget.roomId,
      roomNo: targetRoom?.roomNo || '',
      bedId: transferTarget.bedId || undefined,
      bedNo: targetBed?.bedNo,
      hostelId: showTransfer.hostelId,
      hostelName: showTransfer.hostelName,
    });
    setProcessing(false);
    if (res.success) {
      addToast('Transfer successful', 'success');
      setShowTransfer(null);
      setTransferTarget({ roomId: '', bedId: '' });
      loadData();
    } else {
      addToast((res as any).error || 'Transfer failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Allocations
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Room Allocations</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{activeCount} active allocations</p>
      </div>

      <div className="flex items-center gap-2">
        {(['active', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or room..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Hostel</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Room</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Bed</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Allocated</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">No allocations found</td></tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">{a.studentName.charAt(0)}</div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{a.studentName}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{a.hostelName}</td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{a.roomNo}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{a.bedNo || '-'}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{new Date(a.dateAllocated).toLocaleDateString()}</td>
                    <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => loadHistory(a.id)} className="text-[10px] text-brand-600 hover:text-brand-700 font-medium">View</button>
                        {a.status === 'Active' && (
                          <>
                            <button onClick={() => openTransfer(a)} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium ml-1">Transfer</button>
                            <button onClick={() => setVacateTarget(a.id)} className="text-[10px] text-rose-600 hover:text-rose-700 font-medium ml-1">Vacate</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAlloc && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedAlloc.studentName} · {selectedAlloc.roomNo}</h3>
            <button onClick={() => setSelectedAlloc(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Hostel', value: selectedAlloc.hostelName },
                { label: 'Room', value: selectedAlloc.roomNo },
                { label: 'Bed', value: selectedAlloc.bedNo || '-' },
                { label: 'Allocated', value: new Date(selectedAlloc.dateAllocated).toLocaleDateString() },
                { label: 'Expected Vacate', value: selectedAlloc.expectedVacateDate ? new Date(selectedAlloc.expectedVacateDate).toLocaleDateString() : '-' },
                { label: 'Status', value: selectedAlloc.status },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <p className="text-[10px] text-slate-400 uppercase">{f.label}</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
            {history.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">History</h4>
                <div className="space-y-2">
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
      )}

      {/* Transfer Modal */}
      <Modal isOpen={!!showTransfer} onClose={() => { setShowTransfer(null); setTransferTarget({ roomId: '', bedId: '' }); }} title="Transfer Room" size="lg">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
            <p className="text-[10px] text-slate-400 uppercase">Current Room</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{showTransfer?.roomNo} ({showTransfer?.hostelName})</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target Room</label>
            <select value={transferTarget.roomId} onChange={e => handleRoomSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
              <option value="">Select room</option>
              {availableRooms.map(r => <option key={r.id} value={r.id}>{r.roomNo} ({r.roomType})</option>)}
            </select>
          </div>
          {transferTarget.roomId && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target Bed (optional)</label>
              <select value={transferTarget.bedId} onChange={e => setTransferTarget({ ...transferTarget, bedId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
                <option value="">Select bed</option>
                {transferBeds.map(b => <option key={b.id} value={b.id}>{b.bedNo}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => { setShowTransfer(null); setTransferTarget({ roomId: '', bedId: '' }); }} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">Cancel</button>
            <button onClick={handleTransfer} disabled={processing || !transferTarget.roomId}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:bg-blue-400 text-white text-sm font-medium">{processing ? 'Transferring...' : 'Transfer'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!vacateTarget} onClose={() => setVacateTarget(null)} onConfirm={handleVacate}
        title="Vacate Allocation" message="Are you sure you want to vacate this allocation? The student will lose their room assignment."
        confirmLabel="Vacate" variant="danger" />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
