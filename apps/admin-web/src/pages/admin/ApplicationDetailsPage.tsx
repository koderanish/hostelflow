import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applicationService } from '../../services/application.service';
import { hostelService } from '../../services/hostel.service';
import { studentService } from '../../services/student.service';
import type { HostelApplication } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Edit3, Trash2, ArrowLeft, Clock, History, User, Home, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils';

type Tab = 'overview' | 'review' | 'history';

interface AppEvent {
  id: string;
  applicationId: string;
  eventType: string;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    Created: 'Application Created',
    Updated: 'Details Updated',
    StatusChanged: 'Status Changed',
    Approved: 'Application Approved',
    Rejected: 'Application Rejected',
    Waitlisted: 'Application Waitlisted',
    Cancelled: 'Application Cancelled',
  };
  return map[type] || type;
}

function eventColor(type: string): string {
  if (type === 'Created' || type === 'Approved') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-indigo-600/10';
  if (type === 'Rejected' || type === 'Cancelled') return 'border-sky-400 bg-gradient-to-br from-sky-500/10 to-blue-600/10';
  if (type === 'StatusChanged') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-cyan-500/10';
  if (type === 'Waitlisted') return 'border-indigo-400 bg-gradient-to-br from-indigo-500/10 to-blue-600/10';
  return 'border-slate-300 bg-slate-50 dark:bg-slate-800/30';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Pending: { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    Approved: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Rejected: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    Waitlisted: { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    Cancelled: { bg: 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 dark:text-slate-400', dot: 'bg-slate-400' },
  };
  const c = map[status] || map.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

export function ApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [app, setApp] = useState<HostelApplication | null>(null);
  const [hostelName, setHostelName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'waitlist' | 'cancel'>('approve');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      applicationService.getById(id),
      hostelService.getAll(),
      studentService.getAll(),
    ]).then(([appRes, hostelRes, stuRes]) => {
      if (appRes.success && appRes.data && !appRes.data.isDeleted) {
        setApp(appRes.data);
        const hName = hostelRes.data?.find(h => h.id === appRes.data!.preferredHostelId)?.name || appRes.data!.preferredHostel;
        setHostelName(hName);
        const sName = stuRes.data?.find(s => s.id === appRes.data!.studentId)?.name || appRes.data!.studentName;
        setStudentName(sName);
      } else {
        navigate('/admin/applications');
      }
      setLoading(false);
    });
    applicationService.getHistory(id).then(res => {
      if (res.success && res.data) {
        setEvents(res.data as AppEvent[]);
      }
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!app) return;
    setDeleting(true);
    const res = await applicationService.softDelete(app.id);
    if (res.success) {
      addToast('Application deleted successfully', 'success');
      navigate('/admin/applications');
    } else {
      addToast(res.error || 'Failed to delete application', 'error');
    }
    setDeleting(false);
    setShowDelete(false);
  };

  const openAction = (type: 'approve' | 'reject' | 'waitlist' | 'cancel') => {
    setActionType(type);
    setReviewRemarks('');
    setActionError('');
    setShowActionModal(true);
  };

  const performAction = async () => {
    if (!app) return;
    if (actionType === 'reject' && !reviewRemarks.trim()) {
      setActionError('Review remarks are required for rejection');
      return;
    }
    setActionLoading(true);
    let res;
    switch (actionType) {
      case 'approve':
        res = await applicationService.approveApplication(app.id, 'Admin', reviewRemarks || undefined);
        break;
      case 'reject':
        res = await applicationService.rejectApplication(app.id, 'Admin', reviewRemarks);
        break;
      case 'waitlist':
        res = await applicationService.waitlistApplication(app.id, 'Admin', reviewRemarks || undefined);
        break;
      case 'cancel':
        res = await applicationService.cancelApplication(app.id);
        break;
    }
    if (res.success) {
      addToast(`Application ${actionType}d successfully`, 'success');
      setShowActionModal(false);
      const appRes = await applicationService.getById(app.id);
      if (appRes.success && appRes.data) setApp(appRes.data);
      const evtRes = await applicationService.getHistory(app.id);
      if (evtRes.success && evtRes.data) setEvents(evtRes.data as AppEvent[]);
    } else {
      setActionError(res.error || `Failed to ${actionType} application`);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!app) return null;

  const merged = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const allowedActions: string[] = (() => {
    const map: Record<string, string[]> = {
      Pending: ['approve', 'reject', 'waitlist', 'cancel'],
      Waitlisted: ['approve', 'reject', 'cancel'],
      Approved: ['cancel'],
      Rejected: [],
      Cancelled: [],
    };
    return map[app.status] || [];
  })();

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <User className="w-3.5 h-3.5" /> },
    { key: 'review', label: 'Review', icon: <CheckCircle className="w-3.5 h-3.5" /> },
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
        title={`Application - ${studentName}`}
        description="Hostel application details and review"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/applications"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <Link to={`/admin/applications/${app.id}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
              <Edit3 className="w-4 h-4" /> Edit
            </Link>
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
              {infoRow('Student Name', studentName)}
              {infoRow('Course', app.course)}
              {infoRow('Year', app.year)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-brand-500" /> Application Details
            </h3>
            <div className="space-y-0">
              {infoRow('Preferred Hostel', hostelName)}
              {infoRow('Preferred Room Type', app.preferredRoomType)}
              {infoRow('Academic Year', app.academicYear)}
              {infoRow('Semester', app.semester)}
              {infoRow('Applied Date', app.appliedDate ? formatDate(app.appliedDate) : undefined)}
              <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                <StatusBadge status={app.status} />
              </div>
            </div>
          </div>
          {(app.reason || app.specialRequirements || app.medicalRequirements) && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {app.reason && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Reason</p>
                    <p className="text-sm text-slate-900 dark:text-white">{app.reason}</p>
                  </div>
                )}
                {app.specialRequirements && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Special Requirements</p>
                    <p className="text-sm text-slate-900 dark:text-white">{app.specialRequirements}</p>
                  </div>
                )}
                {app.medicalRequirements && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Medical Requirements</p>
                    <p className="text-sm text-slate-900 dark:text-white">{app.medicalRequirements}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {(app.reviewedBy || app.reviewRemarks) && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Review Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {app.reviewedBy && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Reviewed By</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{app.reviewedBy}</p>
                  </div>
                )}
                {app.reviewedDate && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Reviewed Date</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(app.reviewedDate)}</p>
                  </div>
                )}
                {app.reviewRemarks && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Remarks</p>
                    <p className="text-sm text-slate-900 dark:text-white">{app.reviewRemarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'review' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Review Workflow</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Current status: <StatusBadge status={app.status} /></p>
            </div>
          </div>

          {allowedActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <AlertCircle className="w-10 h-10 mb-3" />
              <p className="text-sm">No actions available for applications with "{app.status}" status</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {allowedActions.includes('approve') && (
                <button onClick={() => openAction('approve')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors font-medium text-sm">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
              )}
              {allowedActions.includes('waitlist') && (
                <button onClick={() => openAction('waitlist')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium text-sm">
                  <Clock className="w-4 h-4" /> Add to Waitlist
                </button>
              )}
              {allowedActions.includes('reject') && (
                <button onClick={() => openAction('reject')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors font-medium text-sm">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              )}
              {allowedActions.includes('cancel') && (
                <button onClick={() => openAction('cancel')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm">
                  <XCircle className="w-4 h-4" /> Cancel Application
                </button>
              )}
            </div>
          )}
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

      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)} title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Application`} size="sm">
        <div className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200 dark:border-rose-800">
              <p className="text-xs text-rose-600 dark:text-rose-400">{actionError}</p>
            </div>
          )}
          {actionType !== 'cancel' && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Review Remarks {actionType === 'reject' ? '*' : ''}
              </label>
              <textarea value={reviewRemarks} onChange={e => setReviewRemarks(e.target.value)}
                rows={3} placeholder="Add your remarks..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
            </div>
          )}
          {actionType === 'cancel' && (
            <p className="text-sm text-slate-600 dark:text-slate-400">Are you sure you want to cancel this application?</p>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowActionModal(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button onClick={performAction} disabled={actionLoading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50 ${
                actionType === 'approve' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500' :
                actionType === 'reject' ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500' :
                actionType === 'waitlist' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500' :
                'bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400'
              }`}>
              {actionLoading ? 'Processing...' : `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Application"
        message={`Are you sure you want to delete this application? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
