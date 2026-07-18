import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentService } from '../../services/document.service';
import type { StudentDocument } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, ShieldCheck, ShieldX, ArrowLeft, FileText, Clock, History } from 'lucide-react';
import { formatDateTime } from '../../utils';

interface DocEvent {
  id: string;
  documentId: string;
  eventType: string;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = { Uploaded: 'Document Uploaded', Verified: 'Document Verified', Rejected: 'Document Rejected', Updated: 'Document Updated', Deleted: 'Document Deleted' };
  return map[type] || type;
}

export function VerifyDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [doc, setDoc] = useState<StudentDocument | null>(null);
  const [events, setEvents] = useState<DocEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<'verify' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      documentService.getById(id),
      documentService.getHistory(id),
    ]).then(([docRes, evtRes]) => {
      if (docRes.success && docRes.data && !docRes.data.isDeleted) {
        if (docRes.data.status !== 'Pending') {
          addToast(`This document is already ${docRes.data.status.toLowerCase()}`, 'info');
          navigate(`/admin/documents/${id}`);
          return;
        }
        setDoc(docRes.data);
        if (evtRes.success && evtRes.data) setEvents(evtRes.data as DocEvent[]);
      } else {
        navigate('/admin/documents');
      }
      setLoading(false);
    });
  }, [id, navigate, addToast]);

  const handleVerify = async () => {
    if (!doc) return;
    setAction('verify');
    setError('');
    setSubmitting(true);
    const res = await documentService.verify(doc.id, 'Admin User');
    if (res.success) {
      addToast('Document verified successfully', 'success');
      navigate('/admin/documents');
    } else {
      setError(res.error || 'Failed to verify');
    }
    setSubmitting(false);
    setAction(null);
  };

  const handleReject = async () => {
    if (!doc) return;
    setAction('reject');
    setError('');
    if (!remarks.trim()) { setError('Remarks are required for rejection'); setAction(null); return; }
    setSubmitting(true);
    const res = await documentService.reject(doc.id, 'Admin User', remarks);
    if (res.success) {
      addToast('Document rejected', 'success');
      navigate('/admin/documents');
    } else {
      setError(res.error || 'Failed to reject');
    }
    setSubmitting(false);
    setAction(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!doc) return null;

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Verify Document"
        description={`Reviewing ${doc.fileName} — ${doc.studentName}`}
        actions={
          <Link to={`/admin/documents/${doc.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" /> Document Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Student</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{doc.studentName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">File Name</span>
              <span className="text-sm text-slate-900 dark:text-white">{doc.fileName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Type</span>
              <span className="text-sm text-slate-900 dark:text-white">{doc.type}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Upload Date</span>
              <span className="text-sm text-slate-900 dark:text-white">{doc.uploadedAt.split('T')[0]}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Pending
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Decision</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Remarks {action === 'reject' ? '*' : '(Optional for rejection)'}
              </label>
              <textarea value={remarks} onChange={e => { setRemarks(e.target.value); setError(''); }}
                rows={4} placeholder={action === 'reject' ? 'Provide reason for rejection...' : 'Add remarks...'}
                className={inputClass} />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200 dark:border-rose-800">
                <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleVerify} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:from-blue-500 hover:to-indigo-600 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting && action === 'verify' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Verify
              </button>
              <button onClick={handleReject} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:from-rose-500 hover:to-pink-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting && action === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldX className="w-4 h-4" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {events.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-brand-500" /> History
          </h3>
          <div className="space-y-0">
            {events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((evt, i) => (
              <div key={evt.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    evt.eventType === 'Verified' ? 'border-emerald-400 bg-emerald-50' :
                    evt.eventType === 'Rejected' ? 'border-rose-400 bg-rose-50' :
                    'border-blue-400 bg-blue-50'
                  }`} />
                  {i < events.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-900 dark:text-white">{eventLabel(evt.eventType)}</span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(evt.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{evt.details}</p>
                  {evt.performedBy && <p className="text-[10px] text-slate-400">by {evt.performedBy}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
