import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { HostelForm } from '../../components/admin/hostel/HostelForm';

export function CreateHostelPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Create Hostel"
        description="Add a new hostel to the system"
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <HostelForm
          onSuccess={() => navigate('/admin/hostels')}
          onCancel={() => navigate('/admin/hostels')}
        />
      </div>
    </div>
  );
}
