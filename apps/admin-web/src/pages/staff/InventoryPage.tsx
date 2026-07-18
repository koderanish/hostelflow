import { useState, useEffect } from 'react';
import { Sparkles, Package, Search, Eye, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { inventoryService } from '../../services/inventory.service';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotification } from '../../hooks/useNotification';
import { ToastContainer } from '../../components/ui/ToastContainer';
import type { InventoryItem } from '../../types';

export function StaffInventoryPage() {
  const { user } = useAuth();
  const { addToast, toasts, removeToast } = useNotification();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'available' | 'out'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [issueModal, setIssueModal] = useState<InventoryItem | null>(null);
  const [returnModal, setReturnModal] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ quantity: 1, issuedTo: '', purpose: '', returnedBy: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadItems();
  }, [user]);

  const loadItems = async () => {
    const res = await inventoryService.getAll();
    if (res.success && res.data) setItems(res.data);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const filtered = items.filter(i => {
    if (filter === 'low-stock') return i.status === 'Low Stock';
    if (filter === 'available') return i.status === 'Available';
    if (filter === 'out') return i.status === 'Out of Stock';
    return true;
  }).filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  const lowStockCount = items.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = items.filter(i => i.status === 'Out of Stock').length;

  const handleIssue = async () => {
    if (!issueModal || !form.issuedTo || !form.purpose || form.quantity < 1) return;
    setProcessing(true);
    const res = await inventoryService.issueItem(issueModal.id, form.quantity, form.issuedTo, form.purpose);
    setProcessing(false);
    if (res.success) {
      addToast('Item issued successfully', 'success');
      setIssueModal(null);
      setForm({ quantity: 1, issuedTo: '', purpose: '', returnedBy: '' });
      loadItems();
    } else {
      addToast(res.error || 'Failed to issue', 'error');
    }
  };

  const handleReturn = async () => {
    if (!returnModal || !form.returnedBy || form.quantity < 1) return;
    setProcessing(true);
    const res = await inventoryService.returnItem(returnModal.id, form.quantity, form.returnedBy);
    setProcessing(false);
    if (res.success) {
      addToast('Item returned successfully', 'success');
      setReturnModal(null);
      setForm({ quantity: 1, issuedTo: '', purpose: '', returnedBy: '' });
      loadItems();
    } else {
      addToast(res.error || 'Failed to return', 'error');
    }
  };

  const loadHistory = async (id: string) => {
    if (selectedItem?.id === id) { setSelectedItem(null); return; }
    const item = items.find(i => i.id === id);
    if (!item) return;
    setSelectedItem(item);
    const hRes = await inventoryService.getHistory(id);
    if (hRes.success && hRes.data) setHistory(hRes.data);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Inventory
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{items.length} items · {lowStockCount} low stock · {outOfStockCount} out of stock</p>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">{lowStockCount} item{lowStockCount > 1 ? 's' : ''} {lowStockCount > 1 ? 'are' : 'is'} running low on stock</p>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'available', 'low-stock', 'out'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {f === 'low-stock' ? 'Low Stock' : f === 'out' ? 'Out of Stock' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Item</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Available</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Condition</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No inventory items found</td></tr>
              ) : (
                filtered.map(i => (
                  <tr key={i.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-brand-500/10 to-accent-500/10">
                          <Package className="w-4 h-4 text-brand-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{i.name}</p>
                          <p className="text-[10px] text-slate-500">{i.sku || i.id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{i.category}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold ${
                        i.status === 'Low Stock' ? 'text-amber-600' :
                        i.status === 'Out of Stock' ? 'text-rose-600' : 'text-emerald-600'
                      }`}>{i.availableQuantity}/{i.quantity} {i.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{i.location}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        i.condition === 'New' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700' :
                        i.condition === 'Good' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700' :
                        i.condition === 'Damaged' ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700' :
                        'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700'
                      }`}>{i.condition}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => loadHistory(i.id)} className="text-[10px] text-brand-600 hover:text-brand-700 font-medium">View</button>
                        {i.availableQuantity > 0 && (
                          <button onClick={() => setIssueModal(i)} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium ml-1">
                            <ArrowDownToLine className="w-3 h-3 inline" /> Issue
                          </button>
                        )}
                        {i.availableQuantity < i.quantity && (
                          <button onClick={() => setReturnModal(i)} className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium ml-1">
                            <ArrowUpFromLine className="w-3 h-3 inline" /> Return
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedItem.name}</h3>
            <button onClick={() => setSelectedItem(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Category', value: selectedItem.category },
                { label: 'Total Qty', value: `${selectedItem.quantity} ${selectedItem.unit}` },
                { label: 'Available', value: `${selectedItem.availableQuantity} ${selectedItem.unit}` },
                { label: 'Location', value: selectedItem.location },
                { label: 'Condition', value: selectedItem.condition },
                { label: 'Status', value: selectedItem.status },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                  <p className="text-[10px] text-slate-400 uppercase">{f.label}</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
            {history.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">History</h4>
                <div className="space-y-2">
                  {history.map((evt: any, idx: number) => (
                    <div key={evt.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${idx === 0 ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        {idx < history.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />}
                      </div>
                      <div className="pb-2">
                        <p className="text-xs font-medium text-slate-900 dark:text-white">{evt.eventType}</p>
                        {evt.details && <p className="text-[10px] text-slate-500 dark:text-slate-400">{evt.details}</p>}
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(evt.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={!!issueModal} onClose={() => { setIssueModal(null); setForm({ quantity: 1, issuedTo: '', purpose: '', returnedBy: '' }); }} title={`Issue ${issueModal?.name || ''}`} size="sm">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Available: {issueModal?.availableQuantity} {issueModal?.unit}</p>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quantity</label>
            <input type="number" min={1} max={issueModal?.availableQuantity || 1} value={form.quantity}
              onChange={e => setForm({ ...form, quantity: Math.max(1, Math.min(parseInt(e.target.value) || 1, issueModal?.availableQuantity || 1)) })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Issued To</label>
            <input value={form.issuedTo} onChange={e => setForm({ ...form, issuedTo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Purpose</label>
            <input value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setIssueModal(null); setForm({ quantity: 1, issuedTo: '', purpose: '', returnedBy: '' }); }} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">Cancel</button>
            <button onClick={handleIssue} disabled={processing || !form.issuedTo || !form.purpose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-medium">{processing ? 'Issuing...' : 'Issue'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!returnModal} onClose={() => { setReturnModal(null); setForm({ quantity: 1, issuedTo: '', purpose: '', returnedBy: '' }); }} title={`Return ${returnModal?.name || ''}`} size="sm">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Can return up to {returnModal ? returnModal.quantity - returnModal.availableQuantity : 0} {returnModal?.unit}</p>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quantity</label>
            <input type="number" min={1} max={returnModal ? returnModal.quantity - returnModal.availableQuantity : 1} value={form.quantity}
              onChange={e => setForm({ ...form, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Returned By</label>
            <input value={form.returnedBy} onChange={e => setForm({ ...form, returnedBy: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setReturnModal(null); setForm({ quantity: 1, issuedTo: '', purpose: '', returnedBy: '' }); }} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">Cancel</button>
            <button onClick={handleReturn} disabled={processing || !form.returnedBy}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium">{processing ? 'Returning...' : 'Return'}</button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
