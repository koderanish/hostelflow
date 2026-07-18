import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { inventoryService } from '../../services/inventory.service';
import type { InventoryItem } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Edit3, Trash2, ArrowLeft, Clock, History, Package, ArrowUpFromLine, ArrowDownToLine } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils';

type Tab = 'overview' | 'actions' | 'history';

interface InventoryEvent {
  id: string;
  itemId: string;
  eventType: string;
  timestamp: string;
  performedBy?: string;
  quantity?: number;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    Created: 'Item Created',
    Updated: 'Item Updated',
    Issued: 'Item Issued',
    Returned: 'Item Returned',
    StatusChanged: 'Status Changed',
    Deleted: 'Item Deleted',
    Restored: 'Item Restored',
  };
  return map[type] || type;
}

function eventColor(type: string): string {
  if (type === 'Created' || type === 'Returned') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-indigo-600/10';
  if (type === 'Issued') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-cyan-500/10';
  if (type === 'StatusChanged') return 'border-indigo-400 bg-gradient-to-br from-indigo-500/10 to-blue-600/10';
  if (type === 'Deleted') return 'border-sky-400 bg-gradient-to-br from-sky-500/10 to-blue-600/10';
  return 'border-slate-300 bg-slate-50 dark:bg-slate-800/30';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Available: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Issued: { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    'Low Stock': { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    'Out of Stock': { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  };
  const c = map[status] || map.Available;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

export function InventoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [events, setEvents] = useState<InventoryEvent[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      inventoryService.getById(id),
      inventoryService.getHistory(id),
    ]).then(([itemRes, evtRes]) => {
      if (itemRes.success && itemRes.data && !itemRes.data.isDeleted) {
        setItem(itemRes.data);
        if (evtRes.success && evtRes.data) setEvents(evtRes.data as InventoryEvent[]);
      } else {
        navigate('/admin/inventory');
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    const res = await inventoryService.softDelete(item.id);
    if (res.success) {
      addToast('Item deleted successfully', 'success');
      navigate('/admin/inventory');
    } else {
      addToast((res as any).error || 'Failed to delete item', 'error');
    }
    setDeleting(false);
    setShowDelete(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!item) return null;

  const merged = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const qtyIssued = item.quantity - item.availableQuantity;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Package className="w-3.5 h-3.5" /> },
    { key: 'actions', label: 'Issue / Return', icon: <ArrowUpFromLine className="w-3.5 h-3.5" /> },
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
        title={item.name}
        description="Inventory item details and management"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/inventory"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
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
              <Package className="w-4 h-4 text-indigo-600" /> Item Information
            </h3>
            <div className="space-y-0">
              {infoRow('Name', item.name)}
              {infoRow('SKU', item.sku)}
              {infoRow('Category', item.category)}
              {infoRow('Condition', undefined)}
              <div className="pt-1 pb-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                  item.condition === 'New' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400' :
                  item.condition === 'Good' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400' :
                  item.condition === 'Damaged' ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400' :
                  'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    item.condition === 'New' ? 'bg-emerald-500' : item.condition === 'Good' ? 'bg-blue-500' : item.condition === 'Damaged' ? 'bg-rose-500' : 'bg-orange-500'
                  }`} />
                  {item.condition}
                </span>
              </div>
              {infoRow('Status', undefined)}
              <div className="pt-1">
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <ArrowUpFromLine className="w-4 h-4 text-brand-500" /> Stock Details
            </h3>
            <div className="space-y-0">
              {infoRow('Total Quantity', `${item.quantity} ${item.unit}`)}
              {infoRow('Available', `${item.availableQuantity} ${item.unit}`)}
              {infoRow('Issued', `${qtyIssued} ${item.unit}`)}
              {infoRow('Location', item.location)}
              {infoRow('Assigned To', item.assignedTo)}
              {infoRow('Vendor', item.vendor)}
              {infoRow('Cost', item.cost ? `₹${item.cost.toLocaleString()}` : '-')}
            </div>
          </div>
          {item.notes && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Notes</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{item.notes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-blue-500" /> Issue Item
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Issue this item to a student, room, or staff member.
            </p>
            <Link to={`/admin/inventory/${item.id}/issue`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-medium transition-all">
              <ArrowDownToLine className="w-4 h-4" /> Issue Item
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <ArrowUpFromLine className="w-4 h-4 text-blue-600" /> Return Item
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Return previously issued items back to inventory.
            </p>
            <Link to={`/admin/inventory/${item.id}/return`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:from-blue-500 hover:to-indigo-600 text-white text-sm font-medium transition-all">
              <ArrowUpFromLine className="w-4 h-4" /> Return Item
            </Link>
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
                      {evt.quantity && <p>Quantity: {evt.quantity}</p>}
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
        title="Delete Inventory Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
