import { useState, useEffect } from 'react';
import { Sparkles, Users, Search, Eye, Check, X, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { visitorService } from '../../services/visitor.service';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../../components/ui/ToastContainer';
import type { Visitor } from '../../types';

interface HistoryEvent { id: string; eventType: string; timestamp: string; details?: string; }

export function WardenVisitorsPage() {
  const { user } = useAuth();
  const { addToast, toasts, removeToast } = useNotification();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'checked-in' | 'checked-out'>('pending');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [actionTarget, setActionTarget] = useState<{ id: string; action: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadVisitors();
  }, [user]);

  const loadVisitors = async () => {
    const res = await visitorService.getAll();
    if (res.success && res.data) setVisitors(res.data);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const filtered = visitors.filter(v => {
    if (filter === 'pending') return v.status === 'Pending';
    if (filter === 'approved') return v.status === 'Approved';
    if (filter === 'checked-in') return v.status === 'Checked In';
    if (filter === 'checked-out') return v.status === 'Checked Out';
    return true;
  }).filter(v => !search || v.visitorName.toLowerCase().includes(search.toLowerCase()) || v.studentName.toLowerCase().includes(search.toLowerCase()));

  const pendingCount = visitors.filter(v => v.status === 'Pending').length;

  const handleAction = async () => {
    if (!actionTarget || !user) return;
    setProcessing(true);
    let res: any;
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    switch (actionTarget.action) {
      case 'approve':
        res = await visitorService.approveVisitor(actionTarget.id, user.name);
        break;
      case 'reject':
        res = await visitorService.rejectVisitor(actionTarget.id, user.name, rejectReason);
        break;
      case 'checkin':
        res = await visitorService.checkIn(actionTarget.id, now);
        break;
      case 'checkout':
        res = await visitorService.checkOut(actionTarget.id, now);
        break;
    }
    setProcessing(false);
    if (res?.success) {
      addToast(`Visitor ${actionTarget.action === 'reject' ? 'rejected' : actionTarget.action + 'ed'} successfully`, 'success');
      setActionTarget(null);
      setRejectReason('');
      loadVisitors();
    } else {
      addToast(res?.error || 'Action failed', 'error');
    }
  };

  const loadHistory = async (id: string) => {
    if (selectedVisitor?.id === id) { setSelectedVisitor(null); return; }
    const v = visitors.find(v => v.id === id);
    if (!v) return;
    setSelectedVisitor(v);
    const hRes = await visitorService.getHistory(id);
    if (hRes.success && hRes.data) setHistory(hRes.data as HistoryEvent[]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Visitors
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Visitor Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{pendingCount > 0 ? `${pendingCount} pending approvals` : 'No pending visitors'}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(['pending', 'approved', 'checked-in', 'checked-out', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {f === 'checked-in' ? 'Checked In' : f === 'checked-out' ? 'Checked Out' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by visitor or student name..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Visitor</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Relation</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No visitors found</td></tr>
              ) : (
                filtered.map(v => (
                  <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">{v.visitorName.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{v.visitorName}</p>
                          <p className="text-[10px] text-slate-500">{v.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{v.studentName}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{v.relation}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{v.date}</td>
                    <td className="py-3 px-4"><StatusBadge status={v.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => loadHistory(v.id)} className="text-[10px] text-brand-600 hover:text-brand-700 font-medium">View</button>
                        {v.status === 'Pending' && (
                          <>
                            <button onClick={() => setActionTarget({ id: v.id, action: 'approve' })} className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium ml-1">Approve</button>
                            <button onClick={() => setActionTarget({ id: v.id, action: 'reject' })} className="text-[10px] text-rose-600 hover:text-rose-700 font-medium ml-1">Reject</button>
                          </>
                        )}
                        {v.status === 'Approved' && (
                          <button onClick={() => setActionTarget({ id: v.id, action: 'checkin' })} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium ml-1">Check In</button>
                        )}
                        {v.status === 'Checked In' && (
                          <button onClick={() => setActionTarget({ id: v.id, action: 'checkout' })} className="text-[10px] text-slate-600 hover:text-slate-700 font-medium ml-1">Check Out</button>
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

      {selectedVisitor && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedVisitor.visitorName}</h3>
            <button onClick={() => setSelectedVisitor(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Phone', value: selectedVisitor.phone },
                { label: 'Student', value: selectedVisitor.studentName },
                { label: 'Relation', value: selectedVisitor.relation },
                { label: 'Date', value: selectedVisitor.date },
                { label: 'Purpose', value: selectedVisitor.purpose || '-' },
                { label: 'Status', value: selectedVisitor.status },
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

      <ConfirmDialog isOpen={actionTarget?.action === 'approve' || actionTarget?.action === 'checkin' || actionTarget?.action === 'checkout'} onClose={() => setActionTarget(null)} onConfirm={handleAction}
        title={actionTarget?.action === 'approve' ? 'Approve Visitor' : actionTarget?.action === 'checkin' ? 'Check In Visitor' : 'Check Out Visitor'}
        message={`Are you sure you want to ${actionTarget?.action === 'approve' ? 'approve' : actionTarget?.action === 'checkin' ? 'check in' : 'check out'} this visitor?`}
        confirmLabel={actionTarget?.action === 'approve' ? 'Approve' : actionTarget?.action === 'checkin' ? 'Check In' : 'Check Out'} variant="info" />

      <Modal isOpen={actionTarget?.action === 'reject' || false} onClose={() => { setActionTarget(null); setRejectReason(''); }} title="Reject Visitor" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason for Rejection</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setActionTarget(null); setRejectReason(''); }} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">Cancel</button>
            <button onClick={handleAction} disabled={processing || !rejectReason.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:bg-rose-400 text-white text-sm font-medium">{processing ? 'Processing...' : 'Reject'}</button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
