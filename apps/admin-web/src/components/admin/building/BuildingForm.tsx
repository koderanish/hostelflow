import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildingFormSchema, type BuildingFormData } from '../../../schemas/building.schema';
import { buildingService } from '../../../services/building.service';
import { useNotify } from '../../../context/NotificationContext';
import { Loader2 } from 'lucide-react';
import type { Hostel, Staff, Building } from '../../../types';

interface BuildingFormProps {
  initialData?: Building;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BuildingForm({ initialData, onSuccess, onCancel }: BuildingFormProps) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [wardens, setWardens] = useState<Staff[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useNotify();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(buildingFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      code: initialData.code,
      hostelId: initialData.hostelId,
      description: initialData.description || '',
      gender: initialData.gender,
      floors: String(initialData.floors || ''),
      capacity: String(initialData.capacity || ''),
      status: initialData.status,
      wardenId: initialData.wardenId,
    } : {
      name: '', code: '', hostelId: '', description: '',
      gender: 'Male', floors: '1', capacity: '50',
      status: 'Active', wardenId: '',
    },
  });

  useEffect(() => {
    buildingService.getHostels().then(res => { if (res.success && res.data) setHostels(res.data); });
    buildingService.getWardens().then(res => { if (res.success && res.data) setWardens(res.data); });
  }, []);

  const onSubmit = async (raw: Record<string, any>) => {
    setSubmitting(true);
    try {
      const payload = {
        name: raw.name,
        code: raw.code,
        hostelId: raw.hostelId,
        description: raw.description || '',
        gender: raw.gender,
        floors: Number(raw.floors),
        capacity: Number(raw.capacity),
        status: raw.status,
        wardenId: raw.wardenId,
      };

      const codeCheck = await buildingService.checkCodeExists(payload.code, payload.hostelId, initialData?.id);
      if (codeCheck.success && codeCheck.data) {
        addToast('A building with this code already exists in this hostel', 'error');
        setSubmitting(false);
        return;
      }

      if (initialData) {
        if (payload.capacity < initialData.occupiedRooms) {
          addToast(`Capacity cannot be less than current occupancy (${initialData.occupiedRooms})`, 'error');
          setSubmitting(false);
          return;
        }
        const res = await buildingService.updateBuilding(initialData.id, payload as any);
        if (!res.success) { addToast(res.error || 'Update failed', 'error'); setSubmitting(false); return; }
        addToast('Building updated successfully', 'success');
      } else {
        const res = await buildingService.createBuilding(payload as any);
        if (!res.success) { addToast(res.error || 'Create failed', 'error'); setSubmitting(false); return; }
        addToast('Building created successfully', 'success');
      }
      onSuccess();
    } catch {
      addToast('An unexpected error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="bf-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Building Name</label>
          <input id="bf-name" type="text" {...register('name')} placeholder="e.g. Block A"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
          {errors.name && <p className="text-xs text-red-400" role="alert">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bf-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Building Code</label>
          <input id="bf-code" type="text" {...register('code')} placeholder="e.g. BLK-A"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
          {errors.code && <p className="text-xs text-red-400" role="alert">{errors.code.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bf-hostel" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hostel</label>
          <select id="bf-hostel" {...register('hostelId')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
            <option value="">Select a hostel</option>
            {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          {errors.hostelId && <p className="text-xs text-red-400" role="alert">{errors.hostelId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bf-gender" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
          <select id="bf-gender" {...register('gender')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Co-ed">Co-ed</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bf-status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
          <select id="bf-status" {...register('status')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bf-warden" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Warden</label>
          <select id="bf-warden" {...register('wardenId')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
            <option value="">Select a warden</option>
            {wardens.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          {errors.wardenId && <p className="text-xs text-red-400" role="alert">{errors.wardenId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bf-floors" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Floors</label>
          <input id="bf-floors" type="number" min={1} {...register('floors')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
          {errors.floors && <p className="text-xs text-red-400" role="alert">{errors.floors.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bf-capacity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Capacity</label>
          <input id="bf-capacity" type="number" min={1} {...register('capacity')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
          {errors.capacity && <p className="text-xs text-red-400" role="alert">{errors.capacity.message}</p>}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="bf-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description (optional)</label>
          <textarea id="bf-desc" rows={3} {...register('description')} placeholder="Additional details about the building..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 resize-none" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? 'Update Building' : 'Create Building'}
        </button>
      </div>
    </form>
  );
}
