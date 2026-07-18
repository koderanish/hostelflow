import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { feeService } from '../../services/fee.service';
import type { Fee } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Edit3, Trash2, ArrowLeft, Clock, History, User, CreditCard, Wallet } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils';

type Tab = 'overview' | 'payment' | 'history';

interface FeeEvent {
  id: string;
  feeId: string;
  eventType: string;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  amount?: number;
  details?: string;
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    Created: 'Fee Created',
    Updated: 'Fee Updated',
    PaymentReceived: 'Payment Received',
    StatusChanged: 'Status Changed',
  };
  return map[type] || type;
}

function eventColor(type: string): string {
  if (type === 'Created' || type === 'PaymentReceived') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-indigo-600/10';
  if (type === 'StatusChanged') return 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-cyan-500/10';
  return 'border-slate-300 bg-slate-50 dark:bg-slate-800/30';
}

function FeeStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    Paid: { bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    Pending: { bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    Partial: { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    Overdue: { bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    Refund: { bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  };
  const c = map[status] || map.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

export function FeeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [fee, setFee] = useState<Fee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [events, setEvents] = useState<FeeEvent[]>([]);

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<string>('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payError, setPayError] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      feeService.getById(id),
      feeService.getHistory(id),
    ]).then(([feeRes, evtRes]) => {
      if (feeRes.success && feeRes.data && !feeRes.data.isDeleted) {
        setFee(feeRes.data);
        if (evtRes.success && evtRes.data) setEvents(evtRes.data as FeeEvent[]);
      } else {
        navigate('/admin/fees');
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!fee) return;
    setDeleting(true);
    const res = await feeService.softDelete(fee.id);
    if (res.success) {
      addToast('Fee record deleted successfully', 'success');
      navigate('/admin/fees');
    } else {
      addToast((res as any).error || 'Failed to delete fee', 'error');
    }
    setDeleting(false);
    setShowDelete(false);
  };

  const handlePayment = async () => {
    if (!fee) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      setPayError('Enter a valid payment amount');
      return;
    }
    const remaining = (fee.amount - (fee.paidAmount || 0));
    if (amount > remaining) {
      setPayError(`Amount exceeds remaining balance of ₹${remaining}`);
      return;
    }
    setPayLoading(true);
    const res = await feeService.recordPayment(fee.id, {
      paidAmount: amount,
      paymentMethod: payMethod as any,
      transactionId: transactionId || undefined,
      paidDate: payDate,
    });
    if (res.success) {
      addToast('Payment recorded successfully', 'success');
      setShowPaymentModal(false);
      setPayAmount('');
      setTransactionId('');
      setPayError('');
      const feeRes = await feeService.getById(fee.id);
      if (feeRes.success && feeRes.data) setFee(feeRes.data);
      const evtRes = await feeService.getHistory(fee.id);
      if (evtRes.success && evtRes.data) setEvents(evtRes.data as FeeEvent[]);
    } else {
      setPayError((res as any).error || 'Payment failed');
    }
    setPayLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!fee) return null;

  const merged = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const canPay = fee.status === 'Pending' || fee.status === 'Partial' || fee.status === 'Overdue';

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <User className="w-3.5 h-3.5" /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard className="w-3.5 h-3.5" /> },
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
        title={`Fee - ${fee.studentName}`}
        description="Fee record details and payment"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/fees"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            {canPay && (
              <button onClick={() => { setPayAmount(String(fee.amount - (fee.paidAmount || 0))); setPayError(''); setShowPaymentModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white text-sm font-medium hover:bg-brand-700 transition-all">
                <CreditCard className="w-4 h-4" /> Record Payment
              </button>
            )}
            <Link to={`/admin/fees/${fee.id}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
              <Edit3 className="w-4 h-4" /> Edit
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
              <User className="w-4 h-4 text-brand-500" /> Fee Information
            </h3>
            <div className="space-y-0">
              {infoRow('Student', fee.studentName)}
              {infoRow('Fee Type', fee.feeType)}
              {infoRow('Amount', `₹${fee.amount.toLocaleString()}`)}
              {infoRow('Paid Amount', `₹${(fee.paidAmount || 0).toLocaleString()}`)}
              {infoRow('Balance', `₹${(fee.balance || 0).toLocaleString()}`)}
              {infoRow('Status', undefined)}
              <div className="pt-1">
                <FeeStatusBadge status={fee.status} />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-brand-500" /> Payment Details
            </h3>
            <div className="space-y-0">
              {infoRow('Due Date', fee.dueDate ? formatDate(fee.dueDate) : undefined)}
              {infoRow('Paid Date', fee.paidDate ? formatDate(fee.paidDate) : '-')}
              {infoRow('Payment Method', fee.paymentMethod || '-')}
              {infoRow('Transaction ID', fee.transactionId || '-')}
              {infoRow('Receipt No', fee.receiptNo || '-')}
              {infoRow('Period', fee.period || '-')}
              {infoRow('Late Fee', fee.lateFee ? `₹${fee.lateFee}` : '-' )}
            </div>
          </div>
          {fee.remarks && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Remarks</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{fee.remarks}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-500" /> Record Payment
          </h3>
          {!canPay ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <CreditCard className="w-10 h-10 mb-3" />
              <p className="text-sm">This fee is already {fee.status.toLowerCase()}. No further payment needed.</p>
            </div>
          ) : (
            <div className="max-w-md space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Total Amount</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">₹{fee.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Remaining</p>
                  <p className="text-lg font-bold text-rose-600">₹{(fee.amount - (fee.paidAmount || 0)).toLocaleString()}</p>
                </div>
              </div>

              {payError && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200 dark:border-rose-800">
                  <p className="text-xs text-rose-600 dark:text-rose-400">{payError}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Amount (₹) *</label>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  min={1} max={fee.amount - (fee.paidAmount || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Date</label>
                  <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Transaction ID</label>
                <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN-12345"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
              </div>
              <button onClick={handlePayment} disabled={payLoading}
                className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {payLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Record Payment
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
                      {evt.amount && <p>Amount: ₹{evt.amount}</p>}
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
        title="Delete Fee Record"
        message="Are you sure you want to delete this fee record? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
