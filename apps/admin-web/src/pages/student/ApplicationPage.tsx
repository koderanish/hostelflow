import { useState, useEffect } from 'react';
import { Sparkles, FileText, CheckCircle, XCircle, Clock, AlertCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services';
import { applicationService } from '../../services/application.service';
import { hostelService } from '../../services/hostel.service';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../../components/ui/ToastContainer';
import type { Student, HostelApplication, Hostel } from '../../types';

interface HistoryEvent { id: string; eventType: string; timestamp: string; details?: string; }

export function StudentApplicationPage() {
  const { user } = useAuth();
  const { addToast, toasts, removeToast } = useNotification();
  const [profile, setProfile] = useState<Student | undefined>();
  const [applications, setApplications] = useState<HostelApplication[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ preferredHostelId: '', preferredRoomType: '', reason: '', specialRequirements: '' });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      studentService.getByUserId(user.id),
      hostelService.getAll(),
    ]).then(([sRes, hRes]) => {
      if (sRes.success && sRes.data) {
        setProfile(sRes.data);
        return loadData(sRes.data.id);
      }
      return null;
    }).then(() => setLoading(false));
  }, [user]);

  const loadData = async (studentId: string) => {
    const appRes = await applicationService.getByStudent(studentId);
    if (appRes.success && appRes.data) {
      setApplications(appRes.data);
      const active = appRes.data.find(a => a.status !== 'Cancelled' && a.status !== 'Rejected');
      if (active) {
        const hRes = await applicationService.getHistory(active.id);
        if (hRes.success && hRes.data) setHistory(hRes.data as HistoryEvent[]);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const activeApp = applications.find(a => a.status !== 'Cancelled' && a.status !== 'Rejected');
  const canApply = !activeApp && !profile?.hostelId;

  const handleApply = async () => {
    if (!profile || !form.preferredHostelId) return;
    setSubmitting(true);
    const hostel = hostels.find(h => h.id === form.preferredHostelId);
    const res = await applicationService.createApplication({
      studentId: profile.id, studentName: profile.name, course: profile.course, year: profile.year,
      preferredHostelId: form.preferredHostelId, preferredHostel: hostel?.name || '',
      preferredRoomType: form.preferredRoomType,
      academicYear: '2024-2025', semester: profile.semester,
      reason: form.reason || undefined, specialRequirements: form.specialRequirements || undefined,
      appliedDate: new Date().toISOString().split('T')[0],
    });
    setSubmitting(false);
    if (res.success) {
      addToast('Application submitted successfully', 'success');
      setShowApply(false);
      setForm({ preferredHostelId: '', preferredRoomType: '', reason: '', specialRequirements: '' });
      loadData(profile.id);
    } else {
      addToast(res.error || 'Failed to submit application', 'error');
    }
  };

  const handleCancel = async () => {
    if (!cancelConfirm) return;
    const res = await applicationService.cancelApplication(cancelConfirm);
    if (res.success) {
      addToast('Application cancelled', 'success');
      setCancelConfirm(null);
      if (profile) loadData(profile.id);
    } else {
      addToast(res.error || 'Failed to cancel', 'error');
      setCancelConfirm(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Application
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Hostel Application</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Apply for hostel accommodation</p>
        </div>
        {canApply && (
          <button onClick={() => setShowApply(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> Apply Now
          </button>
        )}
      </div>

      {activeApp ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Current Application</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Applied on {activeApp.appliedDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={activeApp.status} />
                {(activeApp.status === 'Pending' || activeApp.status === 'Waitlisted') && (
                  <button onClick={() => setCancelConfirm(activeApp.id)} className="flex items-center gap-1 px-3 py-1.5 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <X className="w-3 h-3" /> Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Preferred Hostel', value: activeApp.preferredHostel },
                { label: 'Room Type', value: activeApp.preferredRoomType },
                { label: 'Course', value: activeApp.course },
                { label: 'Year', value: activeApp.year },
                { label: 'Semester', value: activeApp.semester },
                { label: 'Academic Year', value: activeApp.academicYear },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{f.label}</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{f.value || '-'}</p>
                </div>
              ))}
            </div>

            {activeApp.reason && (
              <div className="mb-4">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Reason</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{activeApp.reason}</p>
              </div>
            )}
            {activeApp.reviewRemarks && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Review Remarks</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{activeApp.reviewRemarks}</p>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 p-6">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Application Timeline</h4>
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
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No Active Application</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">You haven't applied for hostel accommodation yet</p>
          {canApply ? (
            <button onClick={() => setShowApply(true)} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium">Apply for Hostel</button>
          ) : profile?.hostelId ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">You already have a room allocation</p>
          ) : null}
        </div>
      )}

      {applications.filter(a => a.status === 'Cancelled' || a.status === 'Rejected').length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Application History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Hostel</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Applied</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {applications.filter(a => a.status === 'Cancelled' || a.status === 'Rejected').map(a => (
                  <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{a.preferredHostel}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{a.appliedDate}</td>
                    <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{a.reviewRemarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showApply} onClose={() => setShowApply(false)} title="Apply for Hostel" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Preferred Hostel</label>
            <select value={form.preferredHostelId} onChange={e => setForm({ ...form, preferredHostelId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
              <option value="">Select hostel</option>
              {hostels.filter(h => h.status === 'Active').map(h => <option key={h.id} value={h.id}>{h.name} ({h.type})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Preferred Room Type</label>
            <select value={form.preferredRoomType} onChange={e => setForm({ ...form, preferredRoomType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
              <option value="Dormitory">Dormitory</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason for Application</label>
            <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Special Requirements</label>
            <textarea value={form.specialRequirements} onChange={e => setForm({ ...form, specialRequirements: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowApply(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <button onClick={handleApply} disabled={submitting || !form.preferredHostelId}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:bg-blue-400 text-white text-sm font-medium">{submitting ? 'Submitting...' : 'Submit Application'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!cancelConfirm} onClose={() => setCancelConfirm(null)} onConfirm={handleCancel}
        title="Cancel Application" message="Are you sure you want to cancel this application? This action cannot be undone."
        confirmLabel="Cancel Application" variant="danger" />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
