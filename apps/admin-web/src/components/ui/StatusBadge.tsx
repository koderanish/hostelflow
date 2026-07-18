interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, string> = {
  Paid: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
  Pending: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
  Overdue: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400',
  Partial: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400',
  Active: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
  Available: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
  Occupied: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400',
  'Under Maintenance': 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
  Resolved: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
  Closed: 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 dark:text-slate-300',
  Open: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400',
  Assigned: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400',
  'In Progress': 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
  Approved: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
  Rejected: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400',
  'Checked Out': 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 dark:text-slate-300',
  Present: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
  Absent: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400',
  Late: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
  'Half-Day': 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 dark:text-orange-400',
  Good: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
  Fair: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
  Poor: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-400',
  'Needs Replacement': 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-700 dark:text-red-400',
  Draft: 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 dark:text-slate-300',
  Submitted: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400',
  Allocated: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400',
  Transferred: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400',
  Vacated: 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 dark:text-slate-300',
};

const dotColorMap: Record<string, string> = {
  Paid: 'bg-emerald-500', Pending: 'bg-amber-500', Overdue: 'bg-rose-500',
  Active: 'bg-emerald-500', Available: 'bg-emerald-500', Occupied: 'bg-blue-500',
  'Under Maintenance': 'bg-amber-500', Resolved: 'bg-emerald-500', Open: 'bg-rose-500',
  Assigned: 'bg-blue-500', 'In Progress': 'bg-amber-500', Approved: 'bg-emerald-500',
  Rejected: 'bg-rose-500', Present: 'bg-emerald-500', Absent: 'bg-rose-500', Late: 'bg-amber-500',
  Good: 'bg-emerald-500', Fair: 'bg-amber-500', Poor: 'bg-rose-500', 'Needs Replacement': 'from-red-500 to-rose-500',
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colorClass = colorMap[status] || 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  const dotClass = dotColorMap[status] || 'bg-slate-500';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-semibold ${colorClass}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {status}
    </span>
  );
}
