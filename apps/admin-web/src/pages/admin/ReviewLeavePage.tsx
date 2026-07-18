import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { leaveService } from '../../services/leave.service';
import type { LeaveRequest } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Check, X, ArrowLeft } from 'lucide-react';

export function ReviewLeavePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [leave, setLeave] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    leaveService.getById(id).then(res => {
      if (res.success && res.data && !res.data.isDeleted) {
        if (res.data.status !== 'Pending') {
          addToast('This leave has already been processed', 'info');
          navigate(`/admin/leaves/${id}`);
          return;
        }
        setLeave(res.data);
      } else {
        navigate('/admin/leaves');
      }
      setLoading(false);
    });
  }, [id, navigate, addToast]);

  const handleAction = async (actionType: 'approve' | 'reject') => {
    if (!leave) return;
    setAction(actionType);
    setError('');

    if (actionType === 'reject' && !remarks.trim()) {
      setError('Remarks are required when rejecting a leave request');
      return;
    }

    setSubmitting(true);
    let res;
    if (actionType === 'approve') {
      res = await leaveService.approveLeave(leave.id, 'Admin', remarks || undefined);
    } else {
      res = await leaveService.rejectLeave(leave.id, 'Admin', remarks);
    }

    if (res.success) {
      addToast(`Leave ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`, 'success');
      navigate('/admin/leaves');
    } else {
      setError((res as any).error || `Failed to ${actionType} leave`);
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

  if (!leave) return null;

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Review Leave Request"
        description={`Reviewing leave for ${leave.studentName}`}
        actions={
          <Link to={`/admin/leaves/${leave.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Leave Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Student</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{leave.studentName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Leave Type</span>
              <span className="text-sm text-slate-900 dark:text-white">{leave.leaveType}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">From</span>
              <span className="text-sm text-slate-900 dark:text-white">{leave.fromDate}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">To</span>
              <span className="text-sm text-slate-900 dark:text-white">{leave.toDate}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Duration</span>
              <span className="text-sm text-slate-900 dark:text-white">
                {Math.max(1, Math.ceil((new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)} day(s)
              </span>
            </div>
            <div className="py-2">
              <span className="text-xs text-slate-500 block mb-1">Reason</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">{leave.reason}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
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
                Approve Leave
              </button>
              <button onClick={() => handleAction('reject')} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:from-rose-500 hover:to-pink-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting && action === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Reject Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
