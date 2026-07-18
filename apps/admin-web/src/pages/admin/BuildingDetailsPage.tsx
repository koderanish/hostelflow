import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { buildingService } from '../../services/building.service';
import type { Building } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { BuildingDetailsCard } from '../../components/admin/building/BuildingDetailsCard';
import { OccupancyCard } from '../../components/admin/building/OccupancyCard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Edit3, Trash2, ArrowLeft, Layers, BedDouble } from 'lucide-react';

export function BuildingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    buildingService.getById(id).then(res => {
      if (res.success && res.data && !res.data.isDeleted) {
        setBuilding(res.data);
      } else {
        navigate('/admin/buildings');
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!building) return;
    setDeleting(true);
    const res = await buildingService.deleteBuilding(building.id);
    if (res.success) {
      addToast('Building deleted successfully', 'success');
      navigate('/admin/buildings');
    } else {
      addToast(res.error || 'Failed to delete building', 'error');
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

  if (!building) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={building.name}
        description="Building details and information"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/buildings"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <Link to={`/admin/buildings/${building.id}/edit`}
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

      <BuildingDetailsCard building={building} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <OccupancyCard label="Room Occupancy" occupied={building.occupiedRooms} total={building.capacity} />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Floor Distribution</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{building.floors} <span className="text-sm font-normal text-slate-400">floors</span></p>
          <div className="mt-3 space-y-2">
            {Array.from({ length: Math.min(building.floors, 5) }).map((_, i) => {
              const floor = i + 1;
              const floorOcc = Math.round(building.occupiedRooms / building.floors);
              const pct = building.capacity > 0 ? Math.round((floorOcc / (building.capacity / building.floors)) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-slate-500">Floor {floor}</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <span className="w-12 text-right text-slate-600 dark:text-slate-400">{pct}%</span>
                </div>
              );
            })}
            {building.floors > 5 && (
              <p className="text-xs text-slate-400 text-center pt-1">+{building.floors - 5} more floors</p>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Building"
        message={`Are you sure you want to delete "${building.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
