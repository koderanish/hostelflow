import { Building2, BedDouble, Users, Warehouse, Layers, UserCheck, Wrench } from 'lucide-react';

interface HostelStatsCardProps {
  label: string;
  value: string | number;
  icon: 'building' | 'bed' | 'users' | 'warehouse' | 'layers' | 'check' | 'wrench';
  color?: string;
}

const ICON_MAP = {
  building: Building2, bed: BedDouble, users: Users,
  warehouse: Warehouse, layers: Layers, check: UserCheck, wrench: Wrench,
};

const COLOR_MAP: Record<string, string> = {
  brand: 'from-blue-500/10 to-cyan-600/5 text-blue-600 dark:text-blue-400',
  emerald: 'from-blue-500/10 to-indigo-600/5 text-blue-600 dark:text-blue-400',
  amber: 'from-indigo-500/10 to-blue-600/5 text-indigo-600 dark:text-indigo-400',
  rose: 'from-sky-500/10 to-blue-600/5 text-sky-600 dark:text-sky-400',
  blue: 'from-blue-500/10 to-blue-600/5 text-blue-600 dark:text-blue-400',
  purple: 'from-indigo-500/10 to-indigo-600/5 text-indigo-600 dark:text-indigo-400',
  cyan: 'from-cyan-500/10 to-cyan-600/5 text-cyan-600 dark:text-cyan-400',
};

export function HostelStatsCard({ label, value, icon, color = 'brand' }: HostelStatsCardProps) {
  const Icon = ICON_MAP[icon];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${COLOR_MAP[color] || COLOR_MAP.brand} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}
