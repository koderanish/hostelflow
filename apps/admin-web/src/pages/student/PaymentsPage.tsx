import { useState, useEffect } from 'react';
import { Sparkles, Wallet, Download, CheckCircle2, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services';
import { feeService } from '../../services/fee.service';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Student, Fee } from '../../types';

export function StudentPaymentsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | undefined>();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    studentService.getByUserId(user.id).then(sRes => {
      if (sRes.success && sRes.data) {
        setProfile(sRes.data);
        return feeService.getByStudent(sRes.data.id);
      }
      return Promise.resolve({ success: true, data: [] });
    }).then((fRes: any) => {
      if (fRes.success && fRes.data) setFees(fRes.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;
  }

  const totalAmount = fees.reduce((a, f) => a + f.amount, 0);
  const paidAmount = fees.filter(f => f.status === 'Paid').reduce((a, f) => a + (f.paidAmount || f.amount), 0);
  const pendingAmount = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').reduce((a, f) => a + (f.balance || f.amount), 0);
  const overdue = fees.filter(f => f.status === 'Overdue');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-brand-500 text-xs font-medium uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Payments
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Fee Payments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">View and pay your hostel fees</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Fees', value: `₹${totalAmount.toLocaleString()}`, icon: Wallet, bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-600' },
          { label: 'Paid Amount', value: `₹${paidAmount.toLocaleString()}`, icon: CheckCircle2, bg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-600' },
          { label: 'Pending Amount', value: `₹${pendingAmount.toLocaleString()}`, icon: Clock, bg: pendingAmount > 0 ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20', iconColor: pendingAmount > 0 ? 'text-amber-600' : 'text-emerald-600' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            </div>
          );
        })}
      </div>

      {overdue.length > 0 && (
        <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-rose-700 dark:text-rose-400">You have {overdue.length} overdue fee payment{overdue.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-rose-600/70 dark:text-rose-400/70">Total overdue: ₹{overdue.reduce((a, f) => a + (f.balance || f.amount), 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fee Type</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Paid</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No fee records found</td></tr>
              ) : (
                fees.map(f => (
                  <tr key={f.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium">{f.feeType}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">₹{f.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{f.paidAmount ? `₹${f.paidAmount.toLocaleString()}` : '-'}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{f.dueDate}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={f.status} /></td>
                    <td className="py-3.5 px-4">
                      {f.status === 'Paid' ? (
                        <button className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
                          <Download className="w-3 h-3" /> Receipt
                        </button>
                      ) : f.status === 'Pending' || f.status === 'Overdue' ? (
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-medium">
                          <CreditCard className="w-3 h-3" /> Pay Now
                        </button>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
