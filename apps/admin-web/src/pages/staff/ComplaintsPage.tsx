import { useState, useEffect } from 'react';
import { Sparkles, Wrench, Search, Eye, CheckCircle2, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaint.service';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../../components/ui/ToastContainer';
import type { Complaint } from '../../types';

interface HistoryEvent { id: string; eventType: string; timestamp: string; details?: string; }

export function StaffComplaintsPage() {
  const { user } = useAuth();
  const { addToast, toasts, removeToast } = useNotification();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'assigned' | 'all' | 'resolved'>('assigned');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [resolveModal, setResolveModal] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, [user]);

  const loadComplaints = async () => {
    const res = await complaintService.getAll();
    if (res.success && res.data) setComplaints(res.data);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const myComplaints = complaints.filter(c => c.assignedToName === user?.name || c.assignedTo === user?.id);
  const filtered = myComplaints.filter(c => {
    if (filter === 'assigned') return c.status === 'Assigned' || c.status === 'In Progress';
    if (filter === 'resolved') return c.status === 'Resolved' || c.status === 'Closed';
    return true;
  }).filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.studentName.toLowerCase().includes(search.toLowerCase()));

  const handleMarkInProgress = async (id: string) => {
    const res = await complaintService.markInProgress(id);
    if (res.success) {
      addToast('Complaint marked as In Progress', 'success');
      loadComplaints();
    } else {
      addToast(res.error || 'Failed to update', 'error');
    }
  };

  const handleResolve = async () => {
    if (!resolveModal || !resolutionNotes.trim()) return;
    setProcessing(true);
    const res = await complaintService.resolveComplaint(resolveModal.id, resolutionNotes);
    setProcessing(false);
    if (res.success) {
      addToast('Complaint resolved', 'success');
      setResolveModal(null);
      setResolutionNotes('');
      loadComplaints();
    } else {
      addToast(res.error || 'Failed to resolve', 'error');
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
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Assigned Complaints</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{myComplaints.filter(c => c.status === 'Assigned' || c.status === 'In Progress').length} active tasks</p>
      </div>

      <div className="flex items-center gap-2">
        {(['assigned', 'all', 'resolved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints..."
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
                        c.priority === 'Critical' ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700' :
                        c.priority === 'High' ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700' :
                        c.priority === 'Medium' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{c.priority}</span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => loadHistory(c.id)} className="text-[10px] text-brand-600 hover:text-brand-700 font-medium">View</button>
                        {c.status === 'Assigned' && (
                          <button onClick={() => handleMarkInProgress(c.id)} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium ml-1">
                            <Play className="w-3 h-3 inline" /> Start
                          </button>
                        )}
                        {c.status === 'In Progress' && (
                          <button onClick={() => setResolveModal(c)} className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium ml-1">
                            <CheckCircle2 className="w-3 h-3 inline" /> Resolve
                          </button>
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

      <Modal isOpen={!!resolveModal} onClose={() => { setResolveModal(null); setResolutionNotes(''); }} title="Resolve Complaint" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Resolution Notes</label>
            <textarea value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setResolveModal(null); setResolutionNotes(''); }} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">Cancel</button>
            <button onClick={handleResolve} disabled={processing || !resolutionNotes.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium">{processing ? 'Resolving...' : 'Resolve'}</button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
