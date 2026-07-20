import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationMessageService } from '../../services/notification-message.service';
import type { NotificationMessage } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Select } from '../../components/ui/Select';
import { useNotify } from '../../context/NotificationContext';
import { Plus, Search, Bell, ChevronLeft, ChevronRight, Eye, Trash2, ArrowUpDown, Send, MailCheck, Clock, Ban } from 'lucide-react';

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Info: { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    Success: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Warning: { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    Error: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  };
  const c = map[type] || map.Info;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /> {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Draft: { bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', dot: 'bg-slate-400' },
    Scheduled: { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    Sent: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Failed: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  };
  const c = map[status] || map.Draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /> {status}
    </span>
  );
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [notifs, setNotifs] = useState<NotificationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<NotificationMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 15;

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (typeFilter !== 'all') filters.type = typeFilter;
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (targetFilter !== 'all') filters.target = targetFilter;
    const res = await notificationMessageService.getPaginated(page, limit, search || undefined, filters, sortBy, sortOrder);
    if (res.success && res.data) {
      setNotifs(res.data.data.filter((n: NotificationMessage) => !n.isDeleted));
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    }
    setLoading(false);
  }, [page, search, typeFilter, statusFilter, targetFilter, sortBy, sortOrder]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await notificationMessageService.softDelete(deleteTarget.id);
    if (res.success) { addToast('Notification deleted', 'success'); setDeleteTarget(null); fetchNotifs(); }
    else { addToast(res.error || 'Delete failed', 'error'); }
    setDeleting(false);
  };

  const handleSend = async (id: string) => {
    const res = await notificationMessageService.send(id);
    if (res.success) { addToast('Notification sent', 'success'); fetchNotifs(); }
    else { addToast(res.error || 'Send failed', 'error'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notifications"
        description="Create and manage system notifications"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/notifications/templates')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Templates
            </button>
            <button onClick={() => navigate('/admin/notifications/create')}
              className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2"><Plus className="w-4 h-4" /> Create</div>
            </button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title or message..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <option value="all">All Types</option>
          <option value="Info">Info</option>
          <option value="Success">Success</option>
          <option value="Warning">Warning</option>
          <option value="Error">Error</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <option value="all">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Sent">Sent</option>
          <option value="Failed">Failed</option>
        </select>
        <select value={targetFilter} onChange={e => { setTargetFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <option value="all">All Targets</option>
          <option value="All">All</option>
          <option value="Student">Student</option>
          <option value="Warden">Warden</option>
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
        </select>
        <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'createdAt', label: 'Created' },
              { value: 'title', label: 'Title' },
              { value: 'type', label: 'Type' },
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
      ) : notifs.length === 0 ? (
        <EmptyState icon={<Bell className="w-8 h-8" />} title="No notifications" description="Create your first notification"
          action={<button onClick={() => navigate('/admin/notifications/create')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium">
            <Plus className="w-4 h-4 inline mr-1" /> Create Notification</button>} />
      ) : (
        <>
          <p className="text-xs text-slate-500">{total} notification{total !== 1 ? 's' : ''} found</p>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Target</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Channel</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Read</th>
                    <th className="text-right py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifs.map((n, idx) => (
                    <tr key={n.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
                      <td className="py-3.5 px-5">
                        <button onClick={() => navigate(`/admin/notifications/${n.id}`)}
                          className="text-left group">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">{n.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </button>
                      </td>
                      <td className="py-3.5 px-5"><TypeBadge type={n.type} /></td>
                      <td className="py-3.5 px-5 text-xs text-slate-600">{n.target}{n.recipientId ? ` (${n.recipientId})` : ''}</td>
                      <td className="py-3.5 px-5"><StatusBadge status={n.status} /></td>
                      <td className="py-3.5 px-5 text-xs text-slate-500">{n.deliveryChannel}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 text-xs ${n.read ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${n.read ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          {n.read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/admin/notifications/${n.id}`)}
                            className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          {(n.status === 'Draft' || n.status === 'Scheduled') && (
                            <button onClick={() => handleSend(n.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Send">
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {n.status !== 'Sent' && (
                            <button onClick={() => setDeleteTarget(n)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
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

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Notification" message={`Delete "${deleteTarget?.title}"?`} confirmLabel="Delete" variant="danger" loading={deleting} />
    </div>
  );
}
