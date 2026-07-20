import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services/inventory.service';
import type { InventoryItem } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Select } from '../../components/ui/Select';
import { useNotify } from '../../context/NotificationContext';
import { Plus, Search, Package, ChevronLeft, ChevronRight, Eye, Trash2, ArrowUpDown } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Available: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Issued: { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    'Low Stock': { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    'Out of Stock': { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  };
  const c = map[status] || map.Available;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    New: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Good: { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    Damaged: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    Repair: { bg: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dot: 'bg-orange-500' },
  };
  const c = map[condition] || map.Good;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {condition}
    </span>
  );
}

export function InventoryPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 15;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (categoryFilter !== 'all') filters.category = categoryFilter;
    if (statusFilter !== 'all') filters.status = statusFilter;
    const res = await inventoryService.getPaginated(page, limit, search || undefined, filters, sortBy, sortOrder);
    if (res.success && res.data) {
      setItems(res.data.data.filter((i: InventoryItem) => !i.isDeleted));
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    }
    setLoading(false);
  }, [page, search, categoryFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await inventoryService.softDelete(deleteTarget.id);
    if (res.success) {
      addToast('Item deleted successfully', 'success');
      setDeleteTarget(null);
      fetchItems();
    } else {
      addToast(res.error || 'Failed to delete item', 'error');
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Inventory Management"
        description="Track hostel assets and supplies"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/inventory/create')}
              className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </div>
            </button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Categories</option>
          <option value="Furniture">Furniture</option>
          <option value="Electrical">Electrical</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Stationery">Stationery</option>
          <option value="Other">Other</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Status</option>
          <option value="Available">Available</option>
          <option value="Issued">Issued</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
        <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'name', label: 'Name' },
              { value: 'category', label: 'Category' },
              { value: 'availableQuantity', label: 'Available' },
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
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No items found"
          description={search ? 'Try adjusting your search or filters' : 'Add your first inventory item'}
          action={
            <button onClick={() => navigate('/admin/inventory/create')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium hover:bg-brand-700 transition-all">
              <Plus className="w-4 h-4 inline mr-1" /> Add Item
            </button>
          }
        />
      ) : (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400">{total} item{total !== 1 ? 's' : ''} found</p>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Item</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Quantity</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Condition</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="text-right py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
                      <td className="py-3.5 px-5">
                        <button onClick={() => navigate(`/admin/inventory/${item.id}`)}
                          className="flex items-center gap-3 group">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-600/20 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{item.name}</p>
                            {item.sku && <p className="text-[10px] text-slate-400">{item.sku}</p>}
                          </div>
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300">{item.category}</td>
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{item.availableQuantity}/{item.quantity}</span>
                        <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <ConditionBadge condition={item.condition} />
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">{item.location}</td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/admin/inventory/${item.id}`)}
                            className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(item)}
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
        title="Delete Inventory Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
