import { useState, useEffect } from 'react';
import { Sparkles, Calendar, CheckCircle2, XCircle, Clock, Search, Eye, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { leaveService } from '../../services/leave.service';
import { studentService } from '../../services/student.service';
import { hostelService } from '../../services/hostel.service';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../../components/ui/ToastContainer';
import type { LeaveRequest } from '../../types';

interface HistoryEvent { id: string; eventType: string; timestamp: string; details?: string; }

export function WardenLeaveApprovalPage() {
  const { user } = useAuth();
  const { addToast, toasts, removeToast } = useNotification();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [actionTarget, setActionTarget] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadLeaves();
  }, [user]);

  const loadLeaves = async () => {
    const res = await leaveService.getAll();
    if (res.success && res.data) setLeaves(res.data);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const filtered = leaves.filter(l => {
    if (filter === 'pending') return l.status === 'Pending';
    if (filter === 'approved') return l.status === 'Approved';
    if (filter === 'rejected') return l.status === 'Rejected' || l.status === 'Cancelled';
    return true;
  }).filter(l => !search || l.studentName.toLowerCase().includes(search.toLowerCase()));

  const handleApprove = async () => {
    if (!actionTarget || !user) return;
    setProcessing(true);
    const res = await leaveService.approveLeave(actionTarget.id, user.name);
    setProcessing(false);
    if (res.success) {
      addToast('Leave approved successfully', 'success');
      setActionTarget(null);
      loadLeaves();
    } else {
      addToast(res.error || 'Failed to approve', 'error');
    }
  };

  const handleReject = async () => {
    if (!actionTarget || !user || !rejectReason.trim()) return;
    setProcessing(true);
    const res = await leaveService.rejectLeave(actionTarget.id, user.name, rejectReason);
    setProcessing(false);
    if (res.success) {
      addToast('Leave rejected', 'success');
      setActionTarget(null);
      setRejectReason('');
      loadLeaves();
    } else {
      addToast(res.error || 'Failed to reject', 'error');
    }
  };

  const loadHistory = async (id: string) => {
    if (selectedLeave?.id === id) { setSelectedLeave(null); return; }
    const l = leaves.find(l => l.id === id);
    if (!l) return;
    setSelectedLeave(l);
    const hRes = await leaveService.getHistory(id);
    if (hRes.success && hRes.data) setHistory(hRes.data as HistoryEvent[]);
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Leave Approval
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Leave Requests</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{pendingCount > 0 ? `${pendingCount} pending requests` : 'All caught up'}</p>
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student name..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">From</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">To</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">No leave requests found</td></tr>
              ) : (
                filtered.map(l => (
                  <tr key={l.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-brand-700">{l.studentName.charAt(0)}</div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{l.studentName}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{l.leaveType}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{l.fromDate}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{l.toDate}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[150px] truncate">{l.reason}</td>
                    <td className="py-3 px-4"><StatusBadge status={l.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => loadHistory(l.id)} className="text-[10px] text-brand-600 hover:text-brand-700 font-medium">View</button>
                        {l.status === 'Pending' && (
                          <>
                            <button onClick={() => setActionTarget({ id: l.id, action: 'approve' })}
                              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium ml-1">Approve</button>
                            <button onClick={() => setActionTarget({ id: l.id, action: 'reject' })}
                              className="text-[10px] text-rose-600 hover:text-rose-700 font-medium ml-1">Reject</button>
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

      {selectedLeave && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedLeave.studentName} · {selectedLeave.leaveType}</h3>
            <button onClick={() => setSelectedLeave(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'From', value: selectedLeave.fromDate },
                { label: 'To', value: selectedLeave.toDate },
                { label: 'Type', value: selectedLeave.leaveType },
                { label: 'Status', value: selectedLeave.status },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <p className="text-[10px] text-slate-400 uppercase">{f.label}</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <p className="text-[10px] text-slate-400 uppercase mb-1">Reason</p>
              <p className="text-xs text-slate-700 dark:text-slate-300">{selectedLeave.reason}</p>
            </div>
            {selectedLeave.remarks && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <p className="text-[10px] text-slate-400 uppercase mb-1">Review Remarks</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{selectedLeave.remarks}</p>
              </div>
            )}
            {history.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Timeline</h4>
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

      <ConfirmDialog isOpen={actionTarget?.action === 'approve' || false} onClose={() => setActionTarget(null)} onConfirm={handleApprove}
        title="Approve Leave" message="Are you sure you want to approve this leave request?"
        confirmLabel="Approve" variant="info" />

      <Modal isOpen={actionTarget?.action === 'reject' || false} onClose={() => { setActionTarget(null); setRejectReason(''); }} title="Reject Leave" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason for Rejection</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setActionTarget(null); setRejectReason(''); }} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">Cancel</button>
            <button onClick={handleReject} disabled={processing || !rejectReason.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:bg-rose-400 text-white text-sm font-medium">{processing ? 'Processing...' : 'Reject'}</button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
