import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services/document.service';
import type { StudentDocument } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Select } from '../../components/ui/Select';
import { useNotify } from '../../context/NotificationContext';
import { Plus, Search, FileText, ChevronLeft, ChevronRight, Eye, Trash2, ArrowUpDown, ShieldCheck, ShieldX } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Pending: { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    Verified: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Rejected: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  };
  const c = map[status] || map.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function DocTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Aadhaar: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400',
    PAN: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-400',
    Passport: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    'Admission Letter': 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Fee Receipt': 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Medical Certificate': 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    Other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${colors[type] || colors.Other}`}>
      {type}
    </span>
  );
}

export function DocumentsPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [docs, setDocs] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<StudentDocument | null>(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 15;

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (typeFilter !== 'all') filters.type = typeFilter;
    if (statusFilter !== 'all') filters.status = statusFilter;
    const res = await documentService.getPaginated(page, limit, search || undefined, filters, sortBy, sortOrder);
    if (res.success && res.data) {
      setDocs(res.data.data.filter((d: StudentDocument) => !d.isDeleted));
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    }
    setLoading(false);
  }, [page, search, typeFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await documentService.softDelete(deleteTarget.id);
    if (res.success) {
      addToast('Document deleted successfully', 'success');
      setDeleteTarget(null);
      fetchDocs();
    } else {
      addToast(res.error || 'Failed to delete document', 'error');
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Documents"
        description="Manage student documents and verifications"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/documents/upload')}
              className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2"><Plus className="w-4 h-4" /> Upload</div>
            </button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by student or file name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Types</option>
          <option value="Aadhaar">Aadhaar</option>
          <option value="PAN">PAN</option>
          <option value="Passport">Passport</option>
          <option value="Admission Letter">Admission Letter</option>
          <option value="Fee Receipt">Fee Receipt</option>
          <option value="Medical Certificate">Medical Certificate</option>
          <option value="Other">Other</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
        </select>
        <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'uploadedAt', label: 'Upload Date' },
              { value: 'studentName', label: 'Student' },
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
      ) : docs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No documents found"
          description={search ? 'Try adjusting your search or filters' : 'Upload your first document'}
          action={
            <button onClick={() => navigate('/admin/documents/upload')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium hover:bg-brand-700 transition-all">
              <Plus className="w-4 h-4 inline mr-1" /> Upload Document
            </button>
          }
        />
      ) : (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400">{total} document{total !== 1 ? 's' : ''} found</p>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Document</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Upload Date</th>
                    <th className="text-left py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="text-right py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d, idx) => (
                    <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
                      <td className="py-3.5 px-5">
                        <button onClick={() => navigate(`/admin/documents/${d.id}`)}
                          className="flex items-center gap-3 group">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                            {d.studentName.charAt(0)}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{d.studentName}</p>
                          </div>
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300">{d.fileName}</td>
                      <td className="py-3.5 px-5"><DocTypeBadge type={d.type} /></td>
                      <td className="py-3.5 px-5 text-xs text-slate-500">{d.uploadedAt.split('T')[0]}</td>
                      <td className="py-3.5 px-5"><StatusBadge status={d.status} /></td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/admin/documents/${d.id}`)}
                            className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          {d.status !== 'Verified' && (
                            <button onClick={() => setDeleteTarget(d)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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
        title="Delete Document"
        message={`Are you sure you want to delete ${deleteTarget?.fileName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
