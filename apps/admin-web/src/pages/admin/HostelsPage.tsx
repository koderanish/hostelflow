import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hostelService } from '../../services/hostel.service';
import type { Hostel } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Select } from '../../components/ui/Select';
import { HostelCard } from '../../components/admin/hostel/HostelCard';
import { useNotify } from '../../context/NotificationContext';
import { Plus, Search, SlidersHorizontal, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

export function HostelsPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Hostel | null>(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 9;

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchHostels = useCallback(async () => {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (typeFilter !== 'all') filters.type = typeFilter;
    const res = await hostelService.getPaginated(page, limit, search || undefined, filters, sortBy, sortOrder);
    if (res.success && res.data) {
      setHostels(res.data.data.filter((h: Hostel) => !h.isDeleted));
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    }
    setLoading(false);
  }, [page, search, statusFilter, typeFilter, sortBy, sortOrder]);

  useEffect(() => { fetchHostels(); }, [fetchHostels]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await hostelService.deleteHostel(deleteTarget.id);
    if (res.success) {
      addToast('Hostel deleted successfully', 'success');
      setDeleteTarget(null);
      fetchHostels();
    } else {
      addToast(res.error || 'Failed to delete hostel', 'error');
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Hostels"
        description="Manage hostel buildings and wings"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/hostels/statistics')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Statistics
            </button>
            <button onClick={() => navigate('/admin/hostels/create')}
              className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Hostel
              </div>
            </button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchInput} onChange={e => { setSearchInput(e.target.value); setPage(1); }}
            placeholder="Search hostels..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Types</option>
          <option value="Boys">Boys</option>
          <option value="Girls">Girls</option>
          <option value="Mixed">Mixed</option>
        </select>
        <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'name', label: 'Name' },
              { value: 'capacity', label: 'Capacity' },
              { value: 'occupied', label: 'Occupied' },
            ]}
          />
          <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            className="text-xs text-slate-500 hover:text-brand-500 transition-colors">
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <LoadingSkeleton rows={3} />
            </div>
          ))}
        </div>
      ) : hostels.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-8 h-8" />}
          title="No hostels found"
          description={search ? 'Try adjusting your search or filters' : 'Get started by creating your first hostel'}
          action={
            <button onClick={() => navigate('/admin/hostels/create')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium hover:bg-brand-700 transition-all">
              <Plus className="w-4 h-4 inline mr-1" /> Add Hostel
            </button>
          }
        />
      ) : (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400">{total} hostel{total !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hostels.map((h, i) => (
              <HostelCard key={h.id} hostel={h} onDelete={setDeleteTarget} idx={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
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
        title="Delete Hostel"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
