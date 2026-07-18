import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hostelService } from '../../services/hostel.service';
import { PageHeader } from '../../components/ui/PageHeader';
import { HostelStatsCard } from '../../components/admin/hostel/HostelStatsCard';
import { ArrowLeft } from 'lucide-react';

interface Stats {
  totalHostels: number; totalCapacity: number; totalOccupied: number;
  occupancyRate: number; activeHostels: number; maintenanceHostels: number;
  totalBuildings: number; totalFloors: number; availableBeds: number; currentStudents: number;
}

export function HostelStatisticsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    hostelService.getStatistics().then(res => {
      if (res.success && res.data) setStats(res.data);
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Hostel Statistics"
        description="Overview of all hostel metrics"
        actions={
          <button onClick={() => navigate('/admin/hostels')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Hostels
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <HostelStatsCard label="Total Hostels" value={stats?.totalHostels ?? '-'} icon="building" color="brand" />
        <HostelStatsCard label="Active Hostels" value={stats?.activeHostels ?? '-'} icon="check" color="emerald" />
        <HostelStatsCard label="Maintenance" value={stats?.maintenanceHostels ?? '-'} icon="wrench" color="amber" />
        <HostelStatsCard label="Total Capacity" value={stats?.totalCapacity ?? '-'} icon="bed" color="blue" />
        <HostelStatsCard label="Current Students" value={stats?.currentStudents ?? '-'} icon="users" color="purple" />
        <HostelStatsCard label="Available Beds" value={stats?.availableBeds ?? '-'} icon="bed" color="emerald" />
        <HostelStatsCard label="Occupancy Rate" value={stats ? `${stats.occupancyRate}%` : '-'} icon="layers" color={stats && stats.occupancyRate > 90 ? 'rose' : 'emerald'} />
        <HostelStatsCard label="Total Buildings" value={stats?.totalBuildings ?? '-'} icon="warehouse" color="cyan" />
        <HostelStatsCard label="Total Floors" value={stats?.totalFloors ?? '-'} icon="layers" color="brand" />
      </div>
    </div>
  );
}
