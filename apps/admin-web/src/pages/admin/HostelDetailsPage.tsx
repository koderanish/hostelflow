import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hostelService } from '../../services/hostel.service';
import type { Hostel } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { HostelDetailsCard } from '../../components/admin/hostel/HostelDetailsCard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Loader2, Edit3, Trash2, ArrowLeft } from 'lucide-react';

export function HostelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    hostelService.getById(id).then(res => {
      if (res.success && res.data && !res.data.isDeleted) {
        setHostel(res.data);
      } else {
        navigate('/admin/hostels');
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!hostel) return;
    setDeleting(true);
    const res = await hostelService.deleteHostel(hostel.id);
    if (res.success) {
      addToast('Hostel deleted successfully', 'success');
      navigate('/admin/hostels');
    } else {
      addToast(res.error || 'Failed to delete hostel', 'error');
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

  if (!hostel) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={hostel.name}
        description="Hostel details and information"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/hostels"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <Link to={`/admin/hostels/${hostel.id}/edit`}
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

      <HostelDetailsCard hostel={hostel} />

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Hostel"
        message={`Are you sure you want to delete "${hostel.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
