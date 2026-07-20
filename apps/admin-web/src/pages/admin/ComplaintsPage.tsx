import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaint.service';
import { staffService } from '../../services/staff.service';
import type { Complaint, Staff } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Select } from '../../components/ui/Select';
import { useNotify } from '../../context/NotificationContext';
import { Plus, Search, SlidersHorizontal, AlertTriangle, ChevronLeft, ChevronRight, Eye, Trash2, ArrowRight, CheckCircle } from 'lucide-react';

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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.bg}`}>
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
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {priority}
    </span>
  );
}

export function ComplaintsPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Complaint | null>(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 15;

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (categoryFilter !== 'all') filters.category = categoryFilter;
    if (priorityFilter !== 'all') filters.priority = priorityFilter;
    const res = await complaintService.getPaginated(page, limit, search || undefined, filters, sortBy, sortOrder);
    if (res.success && res.data) {
      setComplaints(res.data.data.filter((c: Complaint) => !c.isDeleted));
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    }
    setLoading(false);
  }, [page, search, statusFilter, categoryFilter, priorityFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchComplaints();
    staffService.getAll().then(res => {
      if (res.success && res.data) setStaffList(res.data.filter(s => s.status === 'Active'));
    });
  }, [fetchComplaints]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await complaintService.softDelete(deleteTarget.id);
    if (res.success) {
      addToast('Complaint deleted successfully', 'success');
      setDeleteTarget(null);
      fetchComplaints();
    } else {
      addToast((res as any).error || 'Failed to delete', 'error');
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  const handleAssign = async (complaintId: string, staffId: string) => {
    if (!staffId) return;
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;
    const res = await complaintService.assignStaff(complaintId, staffId, staff.name);
    if (res.success) {
      addToast(`Assigned to ${staff.name}`, 'success');
      fetchComplaints();
    } else {
      addToast((res as any).error || 'Failed to assign', 'error');
    }
  };

  const handleStartProgress = async (complaintId: string) => {
    const res = await complaintService.markInProgress(complaintId);
    if (res.success) {
      addToast('Complaint moved to In Progress', 'success');
      fetchComplaints();
    } else {
      addToast((res as any).error || 'Failed to update', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Complaints Management"
        description="Manage student complaints and issues"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/complaints/create')}
              className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Complaint
              </div>
            </button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, student, room..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Categories</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Internet">Internet</option>
          <option value="Furniture">Furniture</option>
          <option value="Other">Other</option>
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'dateAdded', label: 'Date Added' },
              { value: 'priority', label: 'Priority' },
              { value: 'category', label: 'Category' },
              { value: 'status', label: 'Status' },
            ]}
          />
          <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            className="text-xs text-slate-500 hover:text-brand-500 transition-colors">
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <LoadingSkeleton rows={8} />
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="w-8 h-8" />}
          title="No complaints found"
          description={search || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Create a complaint to get started'}
          action={
            <button onClick={() => navigate('/admin/complaints/create')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium hover:bg-brand-700 transition-all">
              <Plus className="w-4 h-4 inline mr-1" /> Create Complaint
            </button>
          }
        />
      ) : (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400">{total} complaint{total !== 1 ? 's' : ''} found</p>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Assigned To</th>
                    <th className="text-right py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c, idx) => (
                    <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
                      <td className="py-3.5 px-5">
                        <button onClick={() => navigate(`/admin/complaints/${c.id}`)}
                          className="text-sm font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left max-w-[200px] truncate block">
                          {c.title}
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300">{c.studentName}</td>
                      <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">{c.category}</td>
                      <td className="py-3.5 px-5"><PriorityBadge priority={c.priority} /></td>
                      <td className="py-3.5 px-5"><StatusBadge status={c.status} /></td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300">{c.assignedToName || '-'}</td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {c.status === 'Open' && (
                            <>
                              <select onChange={e => handleAssign(c.id, e.target.value)} value=""
                                className="text-[10px] px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600">
                                <option value="">Assign</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                              <button onClick={() => handleStartProgress(c.id)}
                                className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Start Progress">
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {(c.status === 'In Progress') && (
                            <button onClick={() => navigate(`/admin/complaints/${c.id}/resolve`)}
                              className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Resolve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {c.status === 'Resolved' && (
                            <button onClick={async () => {
                              const res = await complaintService.closeComplaint(c.id);
                              if (res.success) { addToast('Complaint closed', 'success'); fetchComplaints(); }
                              else { addToast((res as any).error || 'Failed to close', 'error'); }
                            }}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Close">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => navigate(`/admin/complaints/${c.id}`)}
                            className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(c)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    page === i + 1 ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
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
