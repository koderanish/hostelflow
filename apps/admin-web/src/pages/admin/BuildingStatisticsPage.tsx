import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildingService } from '../../services/building.service';
import { PageHeader } from '../../components/ui/PageHeader';
import { BuildingStats } from '../../components/admin/building/BuildingStats';
import { ArrowLeft } from 'lucide-react';

interface Stats {
  totalBuildings: number; totalFloors: number; totalCapacity: number;
  occupiedRooms: number; availableRooms: number; maintenanceBuildings: number;
  occupancyRate: number; students: number;
}

export function BuildingStatisticsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    buildingService.getStatistics().then(res => {
      if (res.success && res.data) setStats(res.data);
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Building Statistics"
        description="Overview of all building metrics"
        actions={
          <button onClick={() => navigate('/admin/buildings')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Buildings
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <BuildingStats label="Total Buildings" value={stats?.totalBuildings ?? '-'} icon="building" color="brand" />
        <BuildingStats label="Total Floors" value={stats?.totalFloors ?? '-'} icon="layers" color="blue" />
        <BuildingStats label="Total Capacity" value={stats?.totalCapacity ?? '-'} icon="bed" color="purple" />
        <BuildingStats label="Occupied Rooms" value={stats?.occupiedRooms ?? '-'} icon="bed" color="emerald" />
        <BuildingStats label="Available Rooms" value={stats?.availableRooms ?? '-'} icon="hash" color="cyan" />
        <BuildingStats label="Maintenance" value={stats?.maintenanceBuildings ?? '-'} icon="wrench" color="amber" />
        <BuildingStats label="Occupancy Rate" value={stats ? `${stats.occupancyRate}%` : '-'} icon="percent" color={stats && stats.occupancyRate > 90 ? 'rose' : 'emerald'} />
        <BuildingStats label="Students" value={stats?.students ?? '-'} icon="users" color="brand" />
      </div>
    </div>
  );
}
