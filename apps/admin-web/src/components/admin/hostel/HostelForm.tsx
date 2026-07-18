import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hostelFormSchema, type HostelFormData } from '../../../schemas/hostel.schema';
import { hostelService } from '../../../services/hostel.service';
import { useNotify } from '../../../context/NotificationContext';
import { ImageUploader } from './ImageUploader';
import { FacilityBadge } from './FacilityBadge';
import { Loader2, Plus, X } from 'lucide-react';
import type { Staff, Hostel } from '../../../types';

interface HostelFormProps {
  initialData?: Hostel;
  onSuccess: () => void;
  onCancel: () => void;
}

const FACILITY_OPTIONS = ['Laundry', 'Gym', 'Common Room', 'Library', 'Kitchen', 'Parking', 'WiFi', 'AC', 'Hot Water', 'Generator'];

export function HostelForm({ initialData, onSuccess, onCancel }: HostelFormProps) {
  const [wardens, setWardens] = useState<Staff[]>([]);
  const [facilityInput, setFacilityInput] = useState('');
  const [facilities, setFacilities] = useState<string[]>(initialData?.facilities || []);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useNotify();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(hostelFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      type: initialData.type,
      gender: initialData.gender,
      capacity: String(initialData.capacity),
      address: initialData.address,
      description: initialData.description || '',
      status: initialData.status,
      wardenId: initialData.wardenId,
      floors: String(initialData.floors || ''),
      buildings: String(initialData.buildings || ''),
      facilities: initialData.facilities,
      images: initialData.images || [],
    } : {
      name: '', type: 'Boys', gender: 'Male', capacity: '100',
      address: '', description: '', status: 'Active',
      wardenId: '', floors: '1', buildings: '1',
      facilities: [], images: [],
    },
  });

  useEffect(() => {
    hostelService.getWardens().then(res => {
      if (res.success && res.data) setWardens(res.data);
    });
  }, []);

  const addFacility = () => {
    const trimmed = facilityInput.trim();
    if (trimmed && !facilities.includes(trimmed)) {
      const next = [...facilities, trimmed];
      setFacilities(next);
      setValue('facilities', next);
    }
    setFacilityInput('');
  };

  const removeFacility = (f: string) => {
    const next = facilities.filter(x => x !== f);
    setFacilities(next);
    setValue('facilities', next);
  };

  const onSubmit = async (raw: Record<string, any>) => {
    setSubmitting(true);
    try {
      const payload = {
        name: raw.name,
        type: raw.type,
        gender: raw.gender,
        capacity: Number(raw.capacity),
        address: raw.address,
        description: raw.description || '',
        status: raw.status,
        wardenId: raw.wardenId,
        wardenName: wardens.find(w => w.id === raw.wardenId)?.name || '',
        floors: raw.floors ? Number(raw.floors) : 1,
        buildings: raw.buildings ? Number(raw.buildings) : 1,
        facilities,
        images,
      };

      if (initialData && payload.capacity < initialData.occupied) {
        addToast(`Capacity cannot be less than current occupancy (${initialData.occupied})`, 'error');
        setSubmitting(false);
        return;
      }

      const nameCheck = await hostelService.checkNameExists(payload.name, initialData?.id);
      if (nameCheck.success && nameCheck.data) {
        addToast('A hostel with this name already exists', 'error');
        setSubmitting(false);
        return;
      }

      if (initialData) {
        const res = await hostelService.updateHostel(initialData.id, payload as any);
        if (!res.success) { addToast(res.error || 'Update failed', 'error'); setSubmitting(false); return; }
        addToast('Hostel updated successfully', 'success');
      } else {
        const res = await hostelService.createHostel(payload as any);
        if (!res.success) { addToast(res.error || 'Create failed', 'error'); setSubmitting(false); return; }
        addToast('Hostel created successfully', 'success');
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
          <label htmlFor="hf-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hostel Name</label>
          <input id="hf-name" type="text" {...register('name')} placeholder="e.g. Boys Hostel A"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
          {errors.name && <p className="text-xs text-red-400" role="alert">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="hf-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hostel Type</label>
          <select id="hf-type" {...register('type')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
            <option value="Mixed">Mixed</option>
          </select>
          {errors.type && <p className="text-xs text-red-400" role="alert">{errors.type.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="hf-gender" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
          <select id="hf-gender" {...register('gender')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Co-ed">Co-ed</option>
          </select>
          {errors.gender && <p className="text-xs text-red-400" role="alert">{errors.gender.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="hf-status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
          <select id="hf-status" {...register('status')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          {errors.status && <p className="text-xs text-red-400" role="alert">{errors.status.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="hf-capacity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Capacity</label>
          <input id="hf-capacity" type="number" min={1} {...register('capacity')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
          {errors.capacity && <p className="text-xs text-red-400" role="alert">{errors.capacity.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="hf-warden" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Warden</label>
          <select id="hf-warden" {...register('wardenId')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500">
            <option value="">Select a warden</option>
            {wardens.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          {errors.wardenId && <p className="text-xs text-red-400" role="alert">{errors.wardenId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="hf-floors" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Floors</label>
          <input id="hf-floors" type="number" min={1} {...register('floors')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
          {errors.floors && <p className="text-xs text-red-400" role="alert">{errors.floors.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="hf-buildings" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Buildings</label>
          <input id="hf-buildings" type="number" min={1} {...register('buildings')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
          {errors.buildings && <p className="text-xs text-red-400" role="alert">{errors.buildings.message}</p>}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="hf-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
          <input id="hf-address" type="text" {...register('address')} placeholder="e.g. North Campus, University Road"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
          {errors.address && <p className="text-xs text-red-400" role="alert">{errors.address.message}</p>}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="hf-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description (optional)</label>
          <textarea id="hf-desc" rows={3} {...register('description')} placeholder="Additional details about the hostel..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 resize-none" />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Facilities</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input type="text" value={facilityInput} onChange={e => setFacilityInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFacility(); } }}
                placeholder="Type a facility and press Enter or Add"
                list="facility-suggestions"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" />
              <datalist id="facility-suggestions">
                {FACILITY_OPTIONS.filter(f => !facilities.includes(f)).map(f => <option key={f} value={f} />)}
              </datalist>
            </div>
            <button type="button" onClick={addFacility}
              className="p-2.5 rounded-xl bg-brand-500 text-white hover:bg-gradient-to-r from-brand-600 to-accent-600 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {facilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {facilities.map(f => <FacilityBadge key={f} facility={f} onRemove={() => removeFacility(f)} />)}
            </div>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Images</label>
          <ImageUploader images={images} onChange={setImages} />
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
          {initialData ? 'Update Hostel' : 'Create Hostel'}
        </button>
      </div>
    </form>
  );
}
