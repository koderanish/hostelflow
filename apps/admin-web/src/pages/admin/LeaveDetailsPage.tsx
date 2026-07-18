import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { leaveService } from '../../services/leave.service';
import type { LeaveRequest } from '../../types';
import { studentService } from '../../services/student.service';
import type { Student } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Edit3, Trash2, ArrowLeft, Clock, History, User, Check, X } from 'lucide-react';
import { formatDateTime } from '../../utils';

type Tab = 'overview' | 'history';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Pending: { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    Approved: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Rejected: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    Cancelled: { bg: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', dot: 'bg-slate-400' },
  };
  const c = map[status] || map.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

interface LeaveEvent {
  id: string;
  leaveId: string;
  eventType: string;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    Applied: 'Leave Applied',
    Updated: 'Leave Updated',
    Approved: 'Leave Approved',
    Rejected: 'Leave Rejected',
    Cancelled: 'Leave Cancelled',
    Deleted: 'Deleted',
    Restored: 'Restored',
  };
  return map[type] || type;
}

function eventColor(type: string): string {
  if (type === 'Applied') return 'border-indigo-400 bg-gradient-to-br from-indigo-500/10 to-blue-600/10';
  if (type === 'Approved') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-indigo-600/10';
  if (type === 'Rejected') return 'border-sky-400 bg-gradient-to-br from-sky-500/10 to-blue-600/10';
  if (type === 'Cancelled') return 'border-slate-400 bg-slate-50 dark:bg-slate-800/30';
  return 'border-slate-300 bg-slate-50 dark:bg-slate-800/30';
}

export function LeaveDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [leave, setLeave] = useState<LeaveRequest | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [events, setEvents] = useState<LeaveEvent[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      leaveService.getById(id),
      leaveService.getHistory(id),
    ]).then(([leaveRes, evtRes]) => {
      if (leaveRes.success && leaveRes.data && !leaveRes.data.isDeleted) {
        setLeave(leaveRes.data);
        if (evtRes.success && evtRes.data) setEvents(evtRes.data as LeaveEvent[]);

        studentService.getById(leaveRes.data.studentId).then(stuRes => {
          if (stuRes.success && stuRes.data) setStudent(stuRes.data);
        });
      } else {
        navigate('/admin/leaves');
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!leave) return;
    setDeleting(true);
    const res = await leaveService.softDelete(leave.id);
    if (res.success) {
      addToast('Leave request deleted successfully', 'success');
      navigate('/admin/leaves');
    } else {
      addToast((res as any).error || 'Failed to delete', 'error');
    }
    setDeleting(false);
    setShowDelete(false);
  };

  const handleCancel = async () => {
    if (!leave) return;
    const res = await leaveService.cancelLeave(leave.id);
    if (res.success) {
      addToast('Leave cancelled successfully', 'success');
      const [leaveRes, evtRes] = await Promise.all([
        leaveService.getById(leave.id),
        leaveService.getHistory(leave.id),
      ]);
      if (leaveRes.success && leaveRes.data) setLeave(leaveRes.data);
      if (evtRes.success && evtRes.data) setEvents(evtRes.data as LeaveEvent[]);
    } else {
      addToast((res as any).error || 'Failed to cancel', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!leave) return null;

  const merged = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const canReview = leave.status === 'Pending';
  const canCancel = leave.status === 'Pending';

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <User className="w-3.5 h-3.5" /> },
    { key: 'history', label: `History (${merged.length})`, icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  const infoRow = (label: string, value: string | undefined) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{value || '-'}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Leave - ${leave.studentName}`}
        description="Leave request details"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/leaves"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            {canReview && (
              <>
                <Link to={`/admin/leaves/${leave.id}/review`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium hover:bg-brand-700 transition-all">
                  <Check className="w-4 h-4" /> Review
                </Link>
                <button onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </>
            )}
            <button onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === t.key
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" /> Student Information
            </h3>
            <div className="space-y-0">
              {infoRow('Name', leave.studentName)}
              {infoRow('Enrollment', student?.enrollmentNo)}
              {infoRow('Department', student?.department)}
              {infoRow('Course', student?.course)}
              {infoRow('Year/Sem', student ? `${student.year} / ${student.semester}` : undefined)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Leave Details</h3>
            <div className="space-y-0">
              {infoRow('Leave Type', leave.leaveType)}
              {infoRow('From Date', leave.fromDate)}
              {infoRow('To Date', leave.toDate)}
              {infoRow('Duration', `${Math.max(1, Math.ceil((new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)} day(s)`)}
              {infoRow('Status', undefined)}
              <div className="pt-1">
                <StatusBadge status={leave.status} />
              </div>
              {leave.remarks && infoRow('Remarks', leave.remarks)}
              {leave.approvedBy && infoRow('Approved/Reviewed By', leave.approvedBy)}
              {leave.reviewedDate && infoRow('Reviewed Date', leave.reviewedDate)}
              {leave.createdAt && infoRow('Applied', formatDateTime(leave.createdAt))}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Reason</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{leave.reason}</p>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          {merged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <History className="w-10 h-10 mb-3" />
              <p className="text-sm">No events recorded yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {merged.map((evt, i) => (
                <div key={evt.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${eventColor(evt.eventType)}`} />
                    {i < merged.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />}
                  </div>
                  <div className="pb-6 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {eventLabel(evt.eventType)}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDateTime(evt.timestamp)}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 space-y-0.5">
                      {evt.previousStatus && evt.newStatus && (
                        <p>{evt.previousStatus} → {evt.newStatus}</p>
                      )}
                      {evt.details && <p>{evt.details}</p>}
                      {evt.performedBy && <p className="text-slate-400">by {evt.performedBy}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Leave Request"
        message="Are you sure you want to delete this leave request? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
