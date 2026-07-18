import { useState, useEffect } from 'react';
import { Sparkles, Calendar, Plus, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services';
import { leaveService } from '../../services/leave.service';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../../components/ui/ToastContainer';
import type { Student, LeaveRequest } from '../../types';

interface HistoryEvent { id: string; eventType: string; timestamp: string; details?: string; }

export function StudentLeavePage() {
  const { user } = useAuth();
  const { addToast, toasts, removeToast } = useNotification();
  const [profile, setProfile] = useState<Student | undefined>();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedLeave, setExpandedLeave] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);

  const [form, setForm] = useState({ leaveType: 'Personal' as LeaveRequest['leaveType'], fromDate: '', toDate: '', reason: '' });

  useEffect(() => {
    if (!user) return;
    studentService.getByUserId(user.id).then(sRes => {
      if (sRes.success && sRes.data) {
        setProfile(sRes.data);
        return leaveService.getByStudent(sRes.data.id);
      }
      return Promise.resolve({ success: true, data: [] });
    }).then((lRes: any) => {
      if (lRes.success && lRes.data) setLeaves(lRes.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const handleApply = async () => {
    if (!profile || !form.fromDate || !form.toDate || !form.reason) return;
    setSubmitting(true);
    const res = await leaveService.applyLeave({
      studentId: profile.id, studentName: profile.name,
      leaveType: form.leaveType, fromDate: form.fromDate, toDate: form.toDate, reason: form.reason,
    });
    setSubmitting(false);
    if (res.success) {
      addToast('Leave applied successfully', 'success');
      setShowApply(false);
      setForm({ leaveType: 'Personal', fromDate: '', toDate: '', reason: '' });
      const lRes = await leaveService.getByStudent(profile.id);
      if (lRes.success && lRes.data) setLeaves(lRes.data);
    } else {
      addToast(res.error || 'Failed to apply leave', 'error');
    }
  };

  const handleCancel = async () => {
    if (!cancelConfirm) return;
    const res = await leaveService.cancelLeave(cancelConfirm);
    if (res.success) {
      addToast('Leave cancelled', 'success');
      setCancelConfirm(null);
      if (profile) {
        const lRes = await leaveService.getByStudent(profile.id);
        if (lRes.success && lRes.data) setLeaves(lRes.data);
      }
    } else {
      addToast(res.error || 'Failed to cancel', 'error');
      setCancelConfirm(null);
    }
  };

  const loadHistory = async (id: string) => {
    if (expandedLeave === id) {
      setExpandedLeave(null);
      setHistory([]);
    } else {
      setExpandedLeave(id);
      const hRes = await leaveService.getHistory(id);
      if (hRes.success && hRes.data) setHistory(hRes.data as HistoryEvent[]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Leave
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Leave Requests</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Apply for leave and track requests</p>
        </div>
        <button onClick={() => setShowApply(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Apply Leave
        </button>
      </div>

      {leaves.filter(l => l.status === 'Pending' || l.status === 'Approved').length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Pending', value: leaves.filter(l => l.status === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10' },
            { label: 'Approved', value: leaves.filter(l => l.status === 'Approved').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10' },
            { label: 'Rejected', value: leaves.filter(l => l.status === 'Rejected').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10' },
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
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leave History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">From</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">To</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No leave records found</td></tr>
              ) : (
                leaves.map(l => (
                  <tr key={l.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium">{l.leaveType}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{l.fromDate}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{l.toDate}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{l.reason}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={l.status} /></td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => loadHistory(l.id)} className="text-[10px] text-brand-600 hover:text-brand-700 font-medium">Timeline</button>
                        {l.status === 'Pending' && (
                          <button onClick={() => setCancelConfirm(l.id)} className="text-[10px] text-rose-600 hover:text-rose-700 font-medium ml-2">Cancel</button>
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

      {expandedLeave && history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Leave Timeline</h4>
          <div className="space-y-3">
            {history.map((evt, idx) => (
              <div key={evt.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 ${idx === 0 ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  {idx < history.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-xs font-medium text-slate-900 dark:text-white">{evt.eventType}</p>
                  {evt.details && <p className="text-[10px] text-slate-500 dark:text-slate-400">{evt.details}</p>}
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{new Date(evt.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showApply} onClose={() => setShowApply(false)} title="Apply for Leave" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Leave Type</label>
              <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value as LeaveRequest['leaveType'] })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
                <option value="Medical">Medical</option>
                <option value="Personal">Personal</option>
                <option value="Family">Family</option>
                <option value="Emergency">Emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div></div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">From Date</label>
              <input type="date" value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">To Date</label>
              <input type="date" value={form.toDate} onChange={e => setForm({ ...form, toDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason</label>
            <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowApply(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <button onClick={handleApply} disabled={submitting || !form.fromDate || !form.toDate || !form.reason}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:bg-blue-400 text-white text-sm font-medium">{submitting ? 'Applying...' : 'Apply'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!cancelConfirm} onClose={() => setCancelConfirm(null)} onConfirm={handleCancel}
        title="Cancel Leave" message="Are you sure you want to cancel this leave request?"
        confirmLabel="Cancel Leave" variant="danger" />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
