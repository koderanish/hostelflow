import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/application.service';
import type { HostelApplication } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Select } from '../../components/ui/Select';
import { useNotify } from '../../context/NotificationContext';
import { Plus, Search, SlidersHorizontal, GraduationCap, ChevronLeft, ChevronRight, Eye, Edit3, Trash2 } from 'lucide-react';

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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

export function ApplicationsPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [apps, setApps] = useState<HostelApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hostelFilter, setHostelFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('appliedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<HostelApplication | null>(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 15;

  const fetchApps = useCallback(async () => {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (hostelFilter !== 'all') filters.hostelId = hostelFilter;
    if (yearFilter !== 'all') filters.academicYear = yearFilter;
    const res = await applicationService.getPaginated(page, limit, search || undefined, filters, sortBy, sortOrder);
    if (res.success && res.data) {
      setApps(res.data.data.filter((a: HostelApplication) => !a.isDeleted));
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    }
    setLoading(false);
  }, [page, search, statusFilter, hostelFilter, yearFilter, sortBy, sortOrder]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await applicationService.softDelete(deleteTarget.id);
    if (res.success) {
      addToast('Application deleted successfully', 'success');
      setDeleteTarget(null);
      fetchApps();
    } else {
      addToast(res.error || 'Failed to delete application', 'error');
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Applications"
        description="Student hostel applications"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/applications/create')}
              className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Application
              </div>
            </button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by student name or hostel..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Waitlisted">Waitlisted</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Years</option>
          <option value="2024-25">2024-25</option>
          <option value="2025-26">2025-26</option>
        </select>
        <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'appliedDate', label: 'Date' },
              { value: 'studentName', label: 'Name' },
              { value: 'status', label: 'Status' },
              { value: 'preferredHostel', label: 'Hostel' },
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
      ) : apps.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-8 h-8" />}
          title="No applications found"
          description={search ? 'Try adjusting your search or filters' : 'Get started by creating a new application'}
          action={
            <button onClick={() => navigate('/admin/applications/create')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium hover:bg-brand-700 transition-all">
              <Plus className="w-4 h-4 inline mr-1" /> Add Application
            </button>
          }
        />
      ) : (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400">{total} application{total !== 1 ? 's' : ''} found</p>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Preferred Hostel</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Room Type</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Applied Date</th>
                    <th className="text-right py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a, idx) => (
                    <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
                      <td className="py-3.5 px-5">
                        <button onClick={() => navigate(`/admin/applications/${a.id}`)}
                          className="flex items-center gap-3 group">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-600/20 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            {a.studentName.charAt(0)}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{a.studentName}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{a.course} · {a.year}</p>
                          </div>
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300">{a.preferredHostel}</td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300">{a.preferredRoomType}</td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">{a.appliedDate}</td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/admin/applications/${a.id}`)}
                            className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/admin/applications/${a.id}/edit`)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(a)}
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
        title="Delete Application"
        message={`Are you sure you want to delete this application from "${deleteTarget?.studentName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
