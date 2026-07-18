import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentService } from '../../services/document.service';
import type { StudentDocument } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Trash2, ArrowLeft, FileText, User, Clock, History, ShieldCheck, ShieldX } from 'lucide-react';
import { formatDateTime } from '../../utils';

interface DocEvent {
  id: string; documentId: string; eventType: string;
  timestamp: string; performedBy?: string;
  previousStatus?: string; newStatus?: string; details?: string;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = { Uploaded: 'Uploaded', Verified: 'Verified', Rejected: 'Rejected', Updated: 'Updated', Deleted: 'Deleted' };
  return map[type] || type;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Pending: { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    Verified: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Rejected: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  };
  const c = map[status] || map.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /> {status}
    </span>
  );
}

export function DocumentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [doc, setDoc] = useState<StudentDocument | null>(null);
  const [events, setEvents] = useState<DocEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      documentService.getById(id),
      documentService.getHistory(id),
    ]).then(([docRes, evtRes]) => {
      if (docRes.success && docRes.data && !docRes.data.isDeleted) {
        setDoc(docRes.data);
        if (evtRes.success && evtRes.data) setEvents(evtRes.data as DocEvent[]);
      } else {
        navigate('/admin/documents');
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!doc) return;
    setDeleting(true);
    const res = await documentService.softDelete(doc.id);
    if (res.success) { addToast('Document deleted', 'success'); navigate('/admin/documents'); }
    else { addToast(res.error || 'Delete failed', 'error'); }
    setDeleting(false); setShowDelete(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (!doc) return null;

  const merged = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const infoRow = (label: string, value: string | undefined) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{value || '-'}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={doc.fileName}
        description={`Document — ${doc.studentName}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/documents"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            {doc.status === 'Pending' && (
              <Link to={`/admin/documents/${doc.id}/verify`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium hover:bg-brand-700 transition-all">
                <ShieldCheck className="w-4 h-4" /> Verify
              </Link>
            )}
            {doc.status !== 'Verified' && (
              <button onClick={() => setShowDelete(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" /> Document Details
          </h3>
          <div className="space-y-0">
            {infoRow('Student', doc.studentName)}
            {infoRow('File Name', doc.fileName)}
            {infoRow('Type', doc.type)}
            {infoRow('Status', undefined)}
            <div className="pt-1 pb-2"><StatusBadge status={doc.status} /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" /> Timeline
          </h3>
          <div className="space-y-0">
            {infoRow('Upload Date', doc.uploadedAt ? formatDateTime(doc.uploadedAt) : undefined)}
            {infoRow('Verified Date', doc.verifiedAt ? formatDateTime(doc.verifiedAt) : undefined)}
            {infoRow('Verified By', doc.verifiedBy)}
            {doc.remarks && infoRow('Remarks', doc.remarks)}
            {doc.fileUrl && infoRow('File URL', doc.fileUrl)}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-brand-500" /> History ({merged.length})
        </h3>
        {merged.length === 0 ? (
          <p className="text-sm text-slate-400">No events recorded</p>
        ) : (
          <div className="space-y-0">
            {merged.map((evt, i) => (
              <div key={evt.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    evt.eventType === 'Verified' ? 'border-emerald-400 bg-emerald-50' :
                    evt.eventType === 'Rejected' ? 'border-rose-400 bg-rose-50' :
                    'border-blue-400 bg-blue-50'
                  }`} />
                  {i < merged.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-900 dark:text-white">{eventLabel(evt.eventType)}</span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(evt.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{evt.details}</p>
                  {evt.performedBy && <p className="text-[10px] text-slate-400">by {evt.performedBy}</p>}
                  {evt.previousStatus && evt.newStatus && (
                    <p className="text-[10px] text-slate-500">{evt.previousStatus} → {evt.newStatus}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete Document" message={`Delete ${doc.fileName}?`} confirmLabel="Delete" variant="danger" loading={deleting} />
    </div>
  );
}
