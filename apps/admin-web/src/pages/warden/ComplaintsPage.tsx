import { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Search, Eye, Wrench, CheckCircle2, XCircle, Clock, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaint.service';
import { staffService } from '../../services/staff.service';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../../components/ui/ToastContainer';
import type { Complaint, Staff } from '../../types';

interface HistoryEvent { id: string; eventType: string; timestamp: string; details?: string; }

export function WardenComplaintsPage() {
  const { user } = useAuth();
  const { addToast, toasts, removeToast } = useNotification();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'assigned' | 'in-progress' | 'resolved'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [actionModal, setActionModal] = useState<{ id: string; action: 'assign' | 'resolve' | 'reject' } | null>(null);
  const [actionData, setActionData] = useState({ staffId: '', staffName: '', resolutionNotes: '', rejectRemarks: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [cRes, stRes] = await Promise.all([
      complaintService.getAll(),
      staffService.getAll(),
    ]);
    if (cRes.success && cRes.data) setComplaints(cRes.data);
    if (stRes.success && stRes.data) setStaff(stRes.data);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const filtered = complaints.filter(c => {
    if (filter === 'open') return c.status === 'Open';
    if (filter === 'assigned') return c.status === 'Assigned';
    if (filter === 'in-progress') return c.status === 'In Progress';
    if (filter === 'resolved') return c.status === 'Resolved' || c.status === 'Closed';
    return true;
  }).filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.studentName.toLowerCase().includes(search.toLowerCase()));

  const openCount = complaints.filter(c => c.status === 'Open').length;

  const handleAction = async () => {
    if (!actionModal || !user) return;
    setProcessing(true);
    let res: any;
    switch (actionModal.action) {
      case 'assign':
        res = await complaintService.assignStaff(actionModal.id, actionData.staffId, actionData.staffName);
        break;
      case 'resolve':
        res = await complaintService.resolveComplaint(actionModal.id, actionData.resolutionNotes);
        break;
      case 'reject':
        res = await complaintService.rejectComplaint(actionModal.id, actionData.rejectRemarks);
        break;
    }
    setProcessing(false);
    if (res?.success) {
      addToast(`Complaint ${actionModal.action === 'reject' ? 'rejected' : actionModal.action === 'assign' ? 'assigned' : 'resolved'} successfully`, 'success');
      setActionModal(null);
      setActionData({ staffId: '', staffName: '', resolutionNotes: '', rejectRemarks: '' });
      loadData();
    } else {
      addToast(res?.error || 'Action failed', 'error');
    }
  };

  const loadHistory = async (id: string) => {
    if (selectedComplaint?.id === id) { setSelectedComplaint(null); return; }
    const c = complaints.find(c => c.id === id);
    if (!c) return;
    setSelectedComplaint(c);
    const hRes = await complaintService.getHistory(id);
    if (hRes.success && hRes.data) setHistory(hRes.data as HistoryEvent[]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Complaints
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Complaint Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{openCount > 0 ? `${openCount} open complaints` : 'All complaints handled'}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'open', 'assigned', 'in-progress', 'resolved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or student..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No complaints found</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium max-w-[200px] truncate">{c.title}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.studentName}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.category}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        c.priority === 'Critical' ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400' :
                        c.priority === 'High' ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        c.priority === 'Medium' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>{c.priority}</span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => loadHistory(c.id)} className="text-[10px] text-brand-600 hover:text-brand-700 font-medium">View</button>
                        {c.status === 'Open' && (
                          <button onClick={() => setActionModal({ id: c.id, action: 'assign' })} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium ml-1">Assign</button>
                        )}
                        {c.status === 'In Progress' && (
                          <button onClick={() => setActionModal({ id: c.id, action: 'resolve' })} className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium ml-1">Resolve</button>
                        )}
                        {c.status === 'Open' && (
                          <button onClick={() => setActionModal({ id: c.id, action: 'reject' })} className="text-[10px] text-rose-600 hover:text-rose-700 font-medium ml-1">Reject</button>
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

      {selectedComplaint && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedComplaint.title}</h3>
            <button onClick={() => setSelectedComplaint(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Student', value: selectedComplaint.studentName },
                { label: 'Room', value: selectedComplaint.roomNo },
                { label: 'Category', value: selectedComplaint.category },
                { label: 'Priority', value: selectedComplaint.priority },
                { label: 'Status', value: selectedComplaint.status },
                { label: 'Date', value: selectedComplaint.dateAdded },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <p className="text-[10px] text-slate-400 uppercase">{f.label}</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <p className="text-[10px] text-slate-400 uppercase mb-1">Description</p>
              <p className="text-xs text-slate-700 dark:text-slate-300">{selectedComplaint.description}</p>
            </div>
            {selectedComplaint.resolutionNotes && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10 mb-4">
                <p className="text-[10px] text-slate-400 uppercase mb-1">Resolution Notes</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{selectedComplaint.resolutionNotes}</p>
              </div>
            )}
            {history.length > 0 && (
              <div>
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

      {/* Assign Modal */}
      <Modal isOpen={actionModal?.action === 'assign' || false} onClose={() => setActionModal(null)} title="Assign Complaint" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assign to Staff</label>
            <select value={actionData.staffId} onChange={e => {
              const st = staff.find(s => s.id === e.target.value);
              setActionData({ ...actionData, staffId: e.target.value, staffName: st?.name || e.target.value });
            }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
              <option value="">Select staff</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActionModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">Cancel</button>
            <button onClick={handleAction} disabled={processing || !actionData.staffId}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:bg-blue-400 text-white text-sm font-medium">{processing ? 'Assigning...' : 'Assign'}</button>
          </div>
        </div>
      </Modal>

      {/* Resolve Modal */}
      <Modal isOpen={actionModal?.action === 'resolve' || false} onClose={() => setActionModal(null)} title="Resolve Complaint" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Resolution Notes</label>
            <textarea value={actionData.resolutionNotes} onChange={e => setActionData({ ...actionData, resolutionNotes: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActionModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">Cancel</button>
            <button onClick={handleAction} disabled={processing || !actionData.resolutionNotes.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:bg-emerald-400 text-white text-sm font-medium">{processing ? 'Resolving...' : 'Resolve'}</button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={actionModal?.action === 'reject' || false} onClose={() => setActionModal(null)} title="Reject Complaint" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rejection Remarks</label>
            <textarea value={actionData.rejectRemarks} onChange={e => setActionData({ ...actionData, rejectRemarks: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActionModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">Cancel</button>
            <button onClick={handleAction} disabled={processing || !actionData.rejectRemarks.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:bg-rose-400 text-white text-sm font-medium">{processing ? 'Rejecting...' : 'Reject'}</button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
