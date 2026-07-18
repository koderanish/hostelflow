import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { BuildingForm } from '../../components/admin/building/BuildingForm';

export function CreateBuildingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Create Building"
        description="Add a new building to a hostel"
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <BuildingForm
          onSuccess={() => navigate('/admin/buildings')}
          onCancel={() => navigate('/admin/buildings')}
        />
      </div>
    </div>
  );
}
