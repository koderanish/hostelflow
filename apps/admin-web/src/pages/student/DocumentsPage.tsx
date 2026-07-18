import { useState, useEffect } from 'react';
import { Sparkles, Upload, FileText, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services';
import { documentService } from '../../services/document.service';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../../components/ui/ToastContainer';
import type { Student, StudentDocument } from '../../types';

interface DocEvent {
  id: string;
  eventType: string;
  timestamp: string;
  details?: string;
  performedBy?: string;
}

export function StudentDocumentsPage() {
  const { user } = useAuth();
  const { addToast, toasts, removeToast } = useNotification();
  const [profile, setProfile] = useState<Student | undefined>();
  const [docs, setDocs] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [history, setHistory] = useState<DocEvent[]>([]);

  const [form, setForm] = useState({ fileName: '', type: 'Other' as StudentDocument['type'], fileUrl: '' });

  useEffect(() => {
    if (!user) return;
    studentService.getByUserId(user.id).then(sRes => {
      if (sRes.success && sRes.data) {
        setProfile(sRes.data);
        return documentService.getByStudent(sRes.data.id);
      }
      return Promise.resolve({ success: true, data: [] });
    }).then((dRes: any) => {
      if (dRes.success && dRes.data) setDocs(dRes.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const handleUpload = async () => {
    if (!profile || !form.fileName) return;
    setSubmitting(true);
    const res = await documentService.upload({
      studentId: profile.id, studentName: profile.name,
      fileName: form.fileName, type: form.type, fileUrl: form.fileUrl || undefined,
    });
    setSubmitting(false);
    if (res.success) {
      addToast('Document uploaded successfully', 'success');
      setShowUpload(false);
      setForm({ fileName: '', type: 'Other', fileUrl: '' });
      const dRes = await documentService.getByStudent(profile.id);
      if (dRes.success && dRes.data) setDocs(dRes.data);
    } else {
      addToast(res.error || 'Failed to upload document', 'error');
    }
  };

  const loadHistory = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setHistory([]);
    } else {
      setExpandedId(id);
      const hRes = await documentService.getHistory(id);
      if (hRes.success && hRes.data) setHistory(hRes.data as DocEvent[]);
    }
  };

  const total = docs.length;
  const pending = docs.filter(d => d.status === 'Pending').length;
  const verified = docs.filter(d => d.status === 'Verified').length;
  const rejected = docs.filter(d => d.status === 'Rejected').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Documents
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Documents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload and track document verification</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium">
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, icon: FileText, color: 'text-slate-600', bg: 'bg-gradient-to-br from-slate-500/10 to-slate-400/10' },
          { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10' },
          { label: 'Verified', value: verified, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10' },
          { label: 'Rejected', value: rejected, icon: XCircle, color: 'text-rose-600', bg: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10' },
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
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Uploaded Documents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">File Name</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Uploaded</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-400">No documents uploaded yet</td></tr>
              ) : (
                docs.map(d => (
                  <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium max-w-[200px] truncate">{d.fileName}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{d.type}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{new Date(d.uploadedAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={d.status} /></td>
                    <td className="py-3.5 px-4">
                      <button onClick={() => loadHistory(d.id)} className="text-[10px] text-brand-600 hover:text-brand-700 font-medium">Timeline</button>
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
          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Document Timeline</h4>
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

      {expandedId && history.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
          <p className="text-sm text-slate-400">No history available for this document</p>
        </div>
      )}

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">File Name</label>
            <input value={form.fileName} onChange={e => setForm({ ...form, fileName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Document Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as StudentDocument['type'] })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
              <option value="Aadhaar">Aadhaar</option>
              <option value="PAN">PAN</option>
              <option value="Passport">Passport</option>
              <option value="Admission Letter">Admission Letter</option>
              <option value="Fee Receipt">Fee Receipt</option>
              <option value="Medical Certificate">Medical Certificate</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">File URL (optional)</label>
            <input value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowUpload(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <button onClick={handleUpload} disabled={submitting || !form.fileName}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:bg-blue-400 text-white text-sm font-medium">{submitting ? 'Uploading...' : 'Upload'}</button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
