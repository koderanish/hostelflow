import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaint.service';
import type { Complaint } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, CheckCircle, X, ArrowLeft, ArrowRight } from 'lucide-react';

export function ResolveComplaintPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [action, setAction] = useState<'resolve' | 'close' | 'reject' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    complaintService.getById(id).then(res => {
      if (res.success && res.data && !res.data.isDeleted) {
        if (res.data.status === 'Closed') {
          addToast('This complaint is already closed', 'info');
          navigate('/admin/complaints');
          return;
        }
        setComplaint(res.data);
      } else {
        navigate('/admin/complaints');
      }
      setLoading(false);
    });
  }, [id, navigate, addToast]);

  const handleAction = async (actionType: 'resolve' | 'close' | 'reject') => {
    if (!complaint) return;
    setAction(actionType);
    setError('');

    if ((actionType === 'resolve' || actionType === 'reject') && !resolutionNotes.trim()) {
      setError(`${actionType === 'resolve' ? 'Resolution notes' : 'Remarks'} are required`);
      return;
    }

    setSubmitting(true);
    let res;
    if (actionType === 'resolve') {
      res = await complaintService.resolveComplaint(complaint.id, resolutionNotes);
    } else if (actionType === 'close') {
      res = await complaintService.closeComplaint(complaint.id);
    } else {
      res = await complaintService.rejectComplaint(complaint.id, resolutionNotes);
    }

    if (res.success) {
      addToast(`Complaint ${actionType === 'resolve' ? 'resolved' : actionType === 'close' ? 'closed' : 'rejected'} successfully`, 'success');
      navigate('/admin/complaints');
    } else {
      setError((res as any).error || `Failed to ${actionType}`);
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

  if (!complaint) return null;

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";

  const statusColors: Record<string, string> = {
    Open: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400',
    'In Progress': 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400',
    Resolved: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
    Closed: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    Rejected: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={
          complaint.status === 'Open' || complaint.status === 'In Progress'
            ? 'Resolve Complaint'
            : complaint.status === 'Resolved'
            ? 'Close Complaint'
            : 'Process Complaint'
        }
        description={`${complaint.title} - ${complaint.studentName}`}
        actions={
          <Link to={`/admin/complaints/${complaint.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Complaint Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Title</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{complaint.title}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Student</span>
              <span className="text-sm text-slate-900 dark:text-white">{complaint.studentName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Room</span>
              <span className="text-sm text-slate-900 dark:text-white">{complaint.roomNo}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Category</span>
              <span className="text-sm text-slate-900 dark:text-white">{complaint.category}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Priority</span>
              <span className="text-sm text-slate-900 dark:text-white">{complaint.priority}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Current Status</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusColors[complaint.status] || ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  complaint.status === 'Resolved' ? 'bg-emerald-500' : complaint.status === 'In Progress' ? 'bg-blue-500' : 'bg-rose-500'
                }`} />
                {complaint.status}
              </span>
            </div>
            <div className="py-2">
              <span className="text-xs text-slate-500 block mb-1">Description</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">{complaint.description}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          {(complaint.status === 'Open' || complaint.status === 'In Progress' || complaint.status === 'Resolved') ? (
            <>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                {complaint.status === 'Resolved' ? 'Close Complaint' : 'Resolution'}
              </h3>
              <div className="space-y-4">
                {(complaint.status !== 'Resolved') && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      {action === 'reject' ? 'Rejection Remarks *' : 'Resolution Notes *'}
                    </label>
                    <textarea value={resolutionNotes} onChange={e => { setResolutionNotes(e.target.value); setError(''); }}
                      rows={5} placeholder={
                        complaint.status === 'Open'
                          ? 'Describe the resolution plan or reject the complaint with reason...'
                          : 'Describe how this complaint was resolved...'
                      }
                      className={inputClass} />
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200 dark:border-rose-800">
                    <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  {(complaint.status === 'In Progress') && (
                    <button onClick={() => handleAction('resolve')} disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting && action === 'resolve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Resolve Complaint
                    </button>
                  )}
                  {(complaint.status === 'Open') && (
                    <>
                      <button onClick={() => handleAction('resolve')} disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {submitting && action === 'resolve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        Resolve (Skip Progress)
                      </button>
                      <button onClick={() => handleAction('reject')} disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:from-rose-500 hover:to-pink-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {submitting && action === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        Reject
                      </button>
                    </>
                  )}
                  {(complaint.status === 'Resolved') && (
                    <button onClick={() => handleAction('close')} disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting && action === 'close' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Close Complaint
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <p className="text-sm">No actions available for {complaint.status.toLowerCase()} complaints.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
