import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buildingService } from '../../services/building.service';
import type { Building } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { BuildingForm } from '../../components/admin/building/BuildingForm';
import { Loader2 } from 'lucide-react';

export function EditBuildingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    buildingService.getById(id).then(res => {
      if (res.success && res.data) {
        setBuilding(res.data);
      } else {
        navigate('/admin/buildings');
      }
      setLoading(false);
    });
  }, [id, navigate]);

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
        title={`Edit: ${building.name}`}
        description="Update building details"
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <BuildingForm
          initialData={building}
          onSuccess={() => navigate('/admin/buildings')}
          onCancel={() => navigate('/admin/buildings')}
        />
      </div>
    </div>
  );
}
