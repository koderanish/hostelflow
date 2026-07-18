import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { visitorService } from '../../services/visitor.service';
import type { Visitor } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Check, X, ArrowLeft, LogIn } from 'lucide-react';

export function ApproveVisitorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | 'checkin' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    visitorService.getById(id).then(res => {
      if (res.success && res.data && !res.data.isDeleted) {
        if (res.data.status !== 'Pending' && res.data.status !== 'Approved') {
          addToast('This visit has already been completed or rejected', 'info');
          navigate(`/admin/visitors/${id}`);
          return;
        }
        setVisitor(res.data);
      } else {
        navigate('/admin/visitors');
      }
      setLoading(false);
    });
  }, [id, navigate, addToast]);

  const handleAction = async (actionType: 'approve' | 'reject') => {
    if (!visitor) return;
    setAction(actionType);
    setError('');

    if (actionType === 'reject' && !remarks.trim()) {
      setError('Remarks are required when rejecting a visitor');
      return;
    }

    setSubmitting(true);
    let res;
    if (actionType === 'approve') {
      res = await visitorService.approveVisitor(visitor.id, 'Admin', remarks || undefined);
    } else {
      res = await visitorService.rejectVisitor(visitor.id, 'Admin', remarks);
    }

    if (res.success) {
      addToast(`Visit ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`, 'success');
      navigate('/admin/visitors');
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

  if (!visitor) return null;

  const canApprove = visitor.status === 'Pending';
  const canCheckIn = visitor.status === 'Approved';

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={canApprove ? 'Approve/Reject Visit' : 'Check In Visitor'}
        description={canApprove ? `Reviewing visit request from ${visitor.visitorName}` : `Check in ${visitor.visitorName}`}
        actions={
          <Link to={`/admin/visitors/${visitor.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Visitor Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Name</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{visitor.visitorName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Phone</span>
              <span className="text-sm text-slate-900 dark:text-white">{visitor.phone}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Relation</span>
              <span className="text-sm text-slate-900 dark:text-white">{visitor.relation}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Student</span>
              <span className="text-sm text-slate-900 dark:text-white">{visitor.studentName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Date</span>
              <span className="text-sm text-slate-900 dark:text-white">{visitor.date}</span>
            </div>
            {visitor.idProofType && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500">ID Proof</span>
                <span className="text-sm text-slate-900 dark:text-white">{visitor.idProofType}: {visitor.idProofNo}</span>
              </div>
            )}
            {visitor.purpose && (
              <div className="py-2">
                <span className="text-xs text-slate-500 block mb-1">Purpose</span>
                <p className="text-sm text-slate-600 dark:text-slate-400">{visitor.purpose}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          {canApprove ? (
            <>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Decision</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Remarks {action === 'reject' ? '*' : '(Optional)'}
                  </label>
                  <textarea value={remarks} onChange={e => { setRemarks(e.target.value); setError(''); }}
                    rows={4} placeholder={action === 'reject' ? 'Provide reason for rejection...' : 'Add remarks (optional)...'}
                    className={inputClass} />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200 dark:border-rose-800">
                    <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button onClick={() => handleAction('approve')} disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:from-blue-500 hover:to-indigo-600 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting && action === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Approve
                  </button>
                  <button onClick={() => handleAction('reject')} disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:from-rose-500 hover:to-pink-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting && action === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Reject
                  </button>
                </div>
              </div>
            </>
          ) : canCheckIn ? (
            <>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Check In</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">This visitor has been approved. You can now check them in.</p>
              <button onClick={async () => {
                setSubmitting(true);
                const now = new Date().toTimeString().split(' ')[0].slice(0, 5);
                const res = await visitorService.checkIn(visitor.id, now);
                if (res.success) {
                  addToast(`${visitor.visitorName} checked in successfully`, 'success');
                  navigate('/admin/visitors');
                } else {
                  setError((res as any).error || 'Check-in failed');
                }
                setSubmitting(false);
              }} disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Check In Now
              </button>
              {error && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200 dark:border-rose-800">
                  <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <p className="text-sm">No actions available for this visitor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
