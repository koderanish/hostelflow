import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hostelService } from '../../services/hostel.service';
import type { Hostel } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { HostelForm } from '../../components/admin/hostel/HostelForm';
import { Loader2 } from 'lucide-react';

export function EditHostelPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    hostelService.getById(id).then(res => {
      if (res.success && res.data) {
        setHostel(res.data);
      } else {
        navigate('/admin/hostels');
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

  if (!hostel) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Edit: ${hostel.name}`}
        description="Update hostel details"
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <HostelForm
          initialData={hostel}
          onSuccess={() => navigate('/admin/hostels')}
          onCancel={() => navigate('/admin/hostels')}
        />
      </div>
    </div>
  );
}
