import { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Plus, Clock, CheckCircle2, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services';
import { complaintService } from '../../services/complaint.service';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../../components/ui/ToastContainer';
import type { Student, Complaint } from '../../types';

interface HistoryEvent { id: string; eventType: string; timestamp: string; details?: string; }

export function StudentComplaintsPage() {
  const { user } = useAuth();
  const { addToast, toasts, removeToast } = useNotification();
  const [profile, setProfile] = useState<Student | undefined>();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);

  const [form, setForm] = useState({ title: '', description: '', category: 'Other' as Complaint['category'], priority: 'Medium' as Complaint['priority'] });

  useEffect(() => {
    if (!user) return;
    studentService.getByUserId(user.id).then(sRes => {
      if (sRes.success && sRes.data) {
        setProfile(sRes.data);
        return complaintService.getByStudent(sRes.data.id);
      }
      return Promise.resolve({ success: true, data: [] });
    }).then((cRes: any) => {
      if (cRes.success && cRes.data) setComplaints(cRes.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const handleRegister = async () => {
    if (!profile || !form.title || !form.description) return;
    setSubmitting(true);
    const res = await complaintService.createComplaint({
      studentId: profile.id, studentName: profile.name,
      roomId: profile.roomId || '', roomNo: profile.roomNo || 'N/A',
      title: form.title, description: form.description,
      category: form.category, priority: form.priority,
    });
    setSubmitting(false);
    if (res.success) {
      addToast('Complaint registered successfully', 'success');
      setShowRegister(false);
      setForm({ title: '', description: '', category: 'Other', priority: 'Medium' });
      const cRes = await complaintService.getByStudent(profile.id);
      if (cRes.success && cRes.data) setComplaints(cRes.data);
    } else {
      addToast(res.error || 'Failed to register complaint', 'error');
    }
  };

  const loadHistory = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setHistory([]);
    } else {
      setExpandedId(id);
      const hRes = await complaintService.getHistory(id);
      if (hRes.success && hRes.data) setHistory(hRes.data as HistoryEvent[]);
    }
  };

  const activeCount = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Complaints
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Complaints</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Raise and track complaints</p>
        </div>
        <button onClick={() => setShowRegister(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Register Complaint
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: complaints.length, icon: AlertTriangle, color: 'text-slate-600', bg: 'bg-gradient-to-br from-slate-500/10 to-slate-400/10' },
          { label: 'Open', value: complaints.filter(c => c.status === 'Open').length, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10' },
          { label: 'In Progress', value: complaints.filter(c => c.status === 'Assigned' || c.status === 'In Progress').length, icon: Wrench, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10' },
          { label: 'Resolved', value: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10' },
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

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Complaint History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No complaints raised yet</td></tr>
              ) : (
                complaints.map(c => (
                  <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium max-w-[200px] truncate">{c.title}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{c.category}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        c.priority === 'Critical' ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400' :
                        c.priority === 'High' ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        c.priority === 'Medium' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>{c.priority}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{c.dateAdded}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={c.status} /></td>
                    <td className="py-3.5 px-4">
                      <button onClick={() => loadHistory(c.id)} className="text-[10px] text-brand-600 hover:text-brand-700 font-medium">Timeline</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {expandedId && history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Complaint Timeline</h4>
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

      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Register Complaint" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Complaint['category'] })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Internet">Internet</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Complaint['priority'] })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowRegister(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <button onClick={handleRegister} disabled={submitting || !form.title || !form.description}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:bg-blue-400 text-white text-sm font-medium">{submitting ? 'Submitting...' : 'Submit Complaint'}</button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
