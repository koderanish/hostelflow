import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaint.service';
import { staffService } from '../../services/staff.service';
import type { Complaint, Staff } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Edit3, Trash2, ArrowLeft, Clock, History, User, Home, ArrowRight, CheckCircle } from 'lucide-react';
import { formatDateTime } from '../../utils';

type Tab = 'overview' | 'history';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Open: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    'In Progress': { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    Resolved: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Closed: { bg: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', dot: 'bg-slate-400' },
    Rejected: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  };
  const c = map[status] || map.Open;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Critical: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    High: { bg: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dot: 'bg-orange-500' },
    Medium: { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    Low: { bg: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', dot: 'bg-slate-400' },
  };
  const c = map[priority] || map.Medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {priority}
    </span>
  );
}

interface ComplaintEvent {
  id: string;
  complaintId: string;
  eventType: string;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    Created: 'Complaint Created',
    Updated: 'Details Updated',
    StatusChanged: 'Status Changed',
    Assigned: 'Staff Assigned',
    Resolved: 'Complaint Resolved',
    Closed: 'Complaint Closed',
    Rejected: 'Complaint Rejected',
    Deleted: 'Deleted',
    Restored: 'Restored',
  };
  return map[type] || type;
}

function eventColor(type: string): string {
  if (type === 'Created') return 'border-sky-400 bg-gradient-to-br from-sky-500/10 to-blue-600/10';
  if (type === 'Resolved' || type === 'Closed') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-indigo-600/10';
  if (type === 'StatusChanged') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-cyan-500/10';
  if (type === 'Assigned') return 'border-indigo-400 bg-gradient-to-br from-indigo-500/10 to-blue-600/10';
  if (type === 'Rejected') return 'border-sky-400 bg-gradient-to-br from-sky-500/10 to-blue-600/10';
  return 'border-slate-300 bg-slate-50 dark:bg-slate-800/30';
}

export function ComplaintDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [events, setEvents] = useState<ComplaintEvent[]>([]);

  const fetchData = () => {
    if (!id) return;
    Promise.all([
      complaintService.getById(id),
      complaintService.getHistory(id),
    ]).then(([compRes, evtRes]) => {
      if (compRes.success && compRes.data && !compRes.data.isDeleted) {
        setComplaint(compRes.data);
        if (evtRes.success && evtRes.data) setEvents(evtRes.data as ComplaintEvent[]);
      } else {
        navigate('/admin/complaints');
      }
      setLoading(false);
    });
    staffService.getAll().then(res => {
      if (res.success && res.data) setStaffList(res.data.filter(s => s.status === 'Active'));
    });
  };

  useEffect(() => { fetchData(); }, [id, navigate]);

  const handleDelete = async () => {
    if (!complaint) return;
    setDeleting(true);
    const res = await complaintService.softDelete(complaint.id);
    if (res.success) {
      addToast('Complaint deleted successfully', 'success');
      navigate('/admin/complaints');
    } else {
      addToast((res as any).error || 'Failed to delete', 'error');
    }
    setDeleting(false);
    setShowDelete(false);
  };

  const handleAssign = async (staffId: string) => {
    if (!complaint || !staffId) return;
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;
    const res = await complaintService.assignStaff(complaint.id, staffId, staff.name);
    if (res.success) {
      addToast(`Assigned to ${staff.name}`, 'success');
      fetchData();
    } else {
      addToast((res as any).error || 'Failed to assign', 'error');
    }
  };

  const handleStartProgress = async () => {
    if (!complaint) return;
    const res = await complaintService.markInProgress(complaint.id);
    if (res.success) {
      addToast('Complaint moved to In Progress', 'success');
      fetchData();
    } else {
      addToast((res as any).error || 'Failed to update', 'error');
    }
  };

  const handleClose = async () => {
    if (!complaint) return;
    const res = await complaintService.closeComplaint(complaint.id);
    if (res.success) {
      addToast('Complaint closed', 'success');
      fetchData();
    } else {
      addToast((res as any).error || 'Failed to close', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!complaint) return null;

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
        title={complaint.title}
        description={`Complaint by ${complaint.studentName}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/complaints"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            {complaint.status === 'Open' && (
              <>
                <Link to={`/admin/complaints/${complaint.id}/resolve`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
                  <Edit3 className="w-4 h-4" /> Edit
                </Link>
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
              <User className="w-4 h-4 text-brand-500" /> Complaint Information
            </h3>
            <div className="space-y-0">
              {infoRow('Title', complaint.title)}
              {infoRow('Category', complaint.category)}
              {infoRow('Priority', undefined)}
              <div className="pt-1 pb-2.5">
                <PriorityBadge priority={complaint.priority} />
              </div>
              {infoRow('Status', undefined)}
              <div className="pt-1 pb-2.5">
                <StatusBadge status={complaint.status} />
              </div>
              {infoRow('Date Added', complaint.dateAdded)}
              {infoRow('Resolved Date', complaint.resolvedDate || '-')}
              {complaint.assignedToName && infoRow('Assigned To', complaint.assignedToName)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-brand-500" /> Student & Room
            </h3>
            <div className="space-y-0">
              {infoRow('Student Name', complaint.studentName)}
              {infoRow('Room No', complaint.roomNo)}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{complaint.description}</p>
          </div>
          {complaint.resolutionNotes && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Resolution Notes</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{complaint.resolutionNotes}</p>
            </div>
          )}

          {/* Workflow actions */}
          {complaint.status === 'Open' && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Actions</h3>
              <div className="flex flex-wrap items-center gap-3">
                <select onChange={e => handleAssign(e.target.value)} value=""
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
                  <option value="">Assign staff...</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button onClick={handleStartProgress}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-sm font-medium hover:bg-blue-700 transition-all">
                  <ArrowRight className="w-4 h-4" /> Start Progress
                </button>
                <Link to={`/admin/complaints/${complaint.id}/resolve`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Resolve Directly
                </Link>
              </div>
            </div>
          )}
          {complaint.status === 'Resolved' && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Actions</h3>
              <button onClick={handleClose}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all">
                <CheckCircle className="w-4 h-4" /> Close Complaint
              </button>
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
        title="Delete Complaint"
        message="Are you sure you want to delete this complaint? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
