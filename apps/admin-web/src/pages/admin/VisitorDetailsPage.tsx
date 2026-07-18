import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { visitorService } from '../../services/visitor.service';
import type { Visitor } from '../../types';
import { studentService } from '../../services/student.service';
import type { Student } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Trash2, ArrowLeft, Clock, History, User, LogIn, LogOut, Check } from 'lucide-react';
import { formatDateTime } from '../../utils';

type Tab = 'overview' | 'history';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Pending: { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    Approved: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    'Checked In': { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    'Checked Out': { bg: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', dot: 'bg-slate-400' },
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

interface VisitorEvent {
  id: string;
  visitorId: string;
  eventType: string;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    Registered: 'Visitor Registered',
    Updated: 'Details Updated',
    Approved: 'Visit Approved',
    Rejected: 'Visit Rejected',
    CheckedIn: 'Visitor Checked In',
    CheckedOut: 'Visitor Checked Out',
    Cancelled: 'Visit Cancelled',
    Deleted: 'Deleted',
    Restored: 'Restored',
  };
  return map[type] || type;
}

function eventColor(type: string): string {
  if (type === 'Registered') return 'border-indigo-400 bg-gradient-to-br from-indigo-500/10 to-blue-600/10';
  if (type === 'Approved') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-indigo-600/10';
  if (type === 'Rejected') return 'border-sky-400 bg-gradient-to-br from-sky-500/10 to-blue-600/10';
  if (type === 'CheckedIn') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-cyan-500/10';
  if (type === 'CheckedOut') return 'border-slate-400 bg-slate-50 dark:bg-slate-800/30';
  return 'border-slate-300 bg-slate-50 dark:bg-slate-800/30';
}

export function VisitorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [events, setEvents] = useState<VisitorEvent[]>([]);

  const fetchData = () => {
    if (!id) return;
    Promise.all([
      visitorService.getById(id),
      visitorService.getHistory(id),
    ]).then(([visRes, evtRes]) => {
      if (visRes.success && visRes.data && !visRes.data.isDeleted) {
        setVisitor(visRes.data);
        if (evtRes.success && evtRes.data) setEvents(evtRes.data as VisitorEvent[]);
        studentService.getById(visRes.data.studentId).then(stuRes => {
          if (stuRes.success && stuRes.data) setStudent(stuRes.data);
        });
      } else {
        navigate('/admin/visitors');
      }
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, [id, navigate]);

  const handleDelete = async () => {
    if (!visitor) return;
    setDeleting(true);
    const res = await visitorService.softDelete(visitor.id);
    if (res.success) {
      addToast('Visitor record deleted successfully', 'success');
      navigate('/admin/visitors');
    } else {
      addToast((res as any).error || 'Failed to delete', 'error');
    }
    setDeleting(false);
    setShowDelete(false);
  };

  const handleQuickAction = async (action: string) => {
    if (!visitor) return;
    const now = new Date().toTimeString().split(' ')[0].slice(0, 5);
    let res;
    if (action === 'checkin') res = await visitorService.checkIn(visitor.id, now);
    else if (action === 'checkout') res = await visitorService.checkOut(visitor.id, now);
    else if (action === 'cancel') res = await visitorService.cancelVisit(visitor.id, 'Visit cancelled');
    if (res && res.success) {
      addToast(`Visitor ${action === 'checkin' ? 'checked in' : action === 'checkout' ? 'checked out' : 'cancelled'} successfully`, 'success');
      fetchData();
    } else {
      addToast((res as any)?.error || `Failed to ${action}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!visitor) return null;

  const merged = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
        title={`Visitor - ${visitor.visitorName}`}
        description="Visitor record details"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/visitors"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            {visitor.status === 'Pending' && (
              <Link to={`/admin/visitors/${visitor.id}/approve`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium hover:bg-brand-700 transition-all">
                <Check className="w-4 h-4" /> Review
              </Link>
            )}
            {visitor.status === 'Approved' && (
              <button onClick={() => handleQuickAction('checkin')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-sm font-medium hover:bg-blue-700 transition-all">
                <LogIn className="w-4 h-4" /> Check In
              </button>
            )}
            {visitor.status === 'Checked In' && (
              <button onClick={() => handleQuickAction('checkout')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-600 text-white text-sm font-medium hover:bg-slate-700 transition-all">
                <LogOut className="w-4 h-4" /> Check Out
              </button>
            )}
            {visitor.status === 'Pending' && (
              <button onClick={() => handleQuickAction('cancel')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
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
              <User className="w-4 h-4 text-brand-500" /> Visitor Information
            </h3>
            <div className="space-y-0">
              {infoRow('Name', visitor.visitorName)}
              {infoRow('Phone', visitor.phone)}
              {infoRow('Relation', visitor.relation)}
              {infoRow('ID Proof', visitor.idProofType || '-')}
              {infoRow('ID Number', visitor.idProofNo || '-')}
              {infoRow('Purpose', visitor.purpose || '-')}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Visit Details</h3>
            <div className="space-y-0">
              {infoRow('Student', visitor.studentName)}
              {infoRow('Enrollment', student?.enrollmentNo)}
              {infoRow('Visit Date', visitor.date)}
              {infoRow('Check-In', visitor.checkInTime || visitor.inTime || '-')}
              {infoRow('Check-Out', visitor.checkOutTime || visitor.outTime || '-')}
              {infoRow('Status', undefined)}
              <div className="pt-1 flex items-center gap-2">
                <StatusBadge status={visitor.status} />
                {visitor.approvedBy && <span className="text-[10px] text-slate-400">by {visitor.approvedBy}</span>}
              </div>
            </div>
          </div>
          {visitor.remarks && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Remarks</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{visitor.remarks}</p>
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

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Visitor Record"
        message="Are you sure you want to delete this visitor record? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
