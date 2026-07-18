import { BedDouble } from 'lucide-react';

interface OccupancyCardProps {
  label: string;
  occupied: number;
  total: number;
}

export function OccupancyCard({ label, occupied, total }: OccupancyCardProps) {
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const barColor = pct > 90 ? 'from-sky-500 to-blue-600' : pct > 70 ? 'from-indigo-500 to-blue-600' : 'from-blue-500 to-indigo-600';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <BedDouble className="w-4 h-4 text-slate-400" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{occupied} <span className="text-sm font-normal text-slate-400">/ {total}</span></p>
      <div className="mt-3">
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor} transition-all duration-1000`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{pct}% occupancy</p>
      </div>
    </div>
  );
}
