import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { inventoryService } from '../../services/inventory.service';
import type { InventoryItem } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, ArrowLeft, Package } from 'lucide-react';

export function IssueInventoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [issuedTo, setIssuedTo] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    inventoryService.getById(id).then(res => {
      if (res.success && res.data && !res.data.isDeleted) {
        setItem(res.data);
      } else {
        navigate('/admin/inventory');
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleIssue = async () => {
    if (!item) return;
    setError('');
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }
    if (qty > item.availableQuantity) {
      setError(`Cannot issue ${qty} ${item.unit}(s). Only ${item.availableQuantity} available.`);
      return;
    }
    if (!issuedTo.trim()) {
      setError('Issued to is required');
      return;
    }
    if (!purpose.trim()) {
      setError('Purpose is required');
      return;
    }
    setSubmitting(true);
    const res = await inventoryService.issueItem(item.id, qty, issuedTo.trim(), purpose.trim());
    if (res.success) {
      addToast(`Issued ${qty} ${item.unit}(s) successfully`, 'success');
      navigate(`/admin/inventory/${item.id}`);
    } else {
      setError(res.error || 'Failed to issue item');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!item) return null;

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Issue Inventory Item"
        description={`Issue ${item.name} from inventory`}
        actions={
          <Link to={`/admin/inventory/${item.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" /> Item Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Name</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Category</span>
              <span className="text-sm text-slate-900 dark:text-white">{item.category}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Total Quantity</span>
              <span className="text-sm text-slate-900 dark:text-white">{item.quantity} {item.unit}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Available</span>
              <span className="text-sm font-bold text-emerald-600">{item.availableQuantity} {item.unit}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Issue Details</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity *</label>
              <input type="number" value={quantity} onChange={e => { setQuantity(e.target.value); setError(''); }}
                min={1} max={item.availableQuantity} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Issued To *</label>
              <input type="text" value={issuedTo} onChange={e => { setIssuedTo(e.target.value); setError(''); }}
                placeholder="e.g. Room A-101 / Student Name" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Purpose *</label>
              <textarea value={purpose} onChange={e => { setPurpose(e.target.value); setError(''); }}
                rows={3} placeholder="e.g. Room maintenance" className={inputClass} />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200 dark:border-rose-800">
                <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
              </div>
            )}

            <button onClick={handleIssue} disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
              Issue Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
