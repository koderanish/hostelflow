import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { messService } from '../../services/mess.service';
import type { MessMenu } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNotify } from '../../context/NotificationContext';
import { Plus, Soup, Edit3, Trash2, Loader2, Sun, CloudSun, Cookie, Moon, Search } from 'lucide-react';

const mealSchema = z.object({
  day: z.string().min(1, 'Day is required'),
  breakfast: z.string().min(1, 'Breakfast menu is required'),
  lunch: z.string().min(1, 'Lunch menu is required'),
  snacks: z.string().min(1, 'Snacks menu is required'),
  dinner: z.string().min(1, 'Dinner menu is required'),
  special: z.string().optional(),
});

type MealFormData = z.infer<typeof mealSchema>;

function DaySelector({ selected, onChange }: { selected: string; onChange: (d: string) => void }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return (
    <div className="flex flex-wrap gap-2">
      {days.map(day => (
        <button key={day} onClick={() => onChange(day)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            selected === day
              ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-500/25'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-500/50 hover:text-brand-600 dark:hover:text-brand-400'
          }`}>
          {day}
        </button>
      ))}
    </div>
  );
}

export function MealPlansPage() {
  const { addToast } = useNotify();
  const [menus, setMenus] = useState<MessMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MessMenu | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
  });

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    const res = await messService.getAll();
    if (res.success && res.data) setMenus(res.data.filter((m: MessMenu) => !m.isDeleted));
    setLoading(false);
  }, []);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  const startEdit = (menu: MessMenu) => {
    setEditingId(menu.id);
    setValue('day', menu.day);
    setValue('breakfast', menu.breakfast);
    setValue('lunch', menu.lunch);
    setValue('snacks', menu.snacks);
    setValue('dinner', menu.dinner);
    setValue('special', menu.special || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const onSubmit = async (data: MealFormData) => {
    setSubmitting(true);
    let res: any;
    if (editingId) {
      res = await messService.updateMenu(editingId, data);
    } else {
      res = await messService.addMenu(data);
    }
    if (res.success) {
      addToast(editingId ? 'Menu updated successfully' : 'Menu created successfully', 'success');
      cancelEdit();
      fetchMenus();
    } else {
      addToast(res.error || 'Failed to save menu', 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await messService.softDeleteMenu(deleteTarget.id);
    if (res.success) {
      addToast('Menu deleted successfully', 'success');
      setDeleteTarget(null);
      fetchMenus();
    } else {
      addToast(res.error || 'Failed to delete menu', 'error');
    }
    setDeleting(false);
  };

  const selectedMenu = menus.find(m => m.day === selectedDay);
  const existingDays = menus.map(m => m.day);

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const errorClass = "text-xs text-rose-500 mt-1";

  const mealFields = [
    { key: 'breakfast', label: 'Breakfast', icon: Sun, color: 'bg-orange-500' },
    { key: 'lunch', label: 'Lunch', icon: CloudSun, color: 'bg-amber-500' },
    { key: 'snacks', label: 'Snacks', icon: Cookie, color: 'bg-pink-500' },
    { key: 'dinner', label: 'Dinner', icon: Moon, color: 'bg-indigo-500' },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Meal Plans"
        description="Manage weekly mess menu"
        actions={
          <button onClick={() => { cancelEdit(); setSelectedDay('Monday'); }}
            className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2"><Plus className="w-4 h-4" /> New Menu</div>
          </button>
        }
      />

      <DaySelector selected={selectedDay} onChange={setSelectedDay} />

      {editingId !== null || (!existingDays.includes(selectedDay)) ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            {editingId ? `Edit Menu - ${selectedDay}` : `Create Menu - ${selectedDay}`}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <input type="hidden" {...register('day')} value={selectedDay} />
            <p className="text-xs text-slate-400">Editing menu for <strong>{selectedDay}</strong></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mealFields.map(mf => (
                <div key={mf.key} className="space-y-1.5">
                  <label className={labelClass}>{mf.label} *</label>
                  <textarea {...register(mf.key as keyof MealFormData)} rows={2} className={inputClass} placeholder={`e.g. ${mf.label} items...`} />
                  {errors[mf.key as keyof MealFormData] && <p className={errorClass}>{errors[mf.key as keyof MealFormData]?.message}</p>}
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Special Items</label>
              <input type="text" {...register('special')} placeholder="e.g. Festival special" className={inputClass} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={cancelEdit}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Menu' : 'Create Menu'}
              </button>
            </div>
          </form>
        </div>
      ) : selectedMenu ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {mealFields.map((mf, idx) => {
            const Icon = mf.icon;
            const value = selectedMenu[mf.key as keyof MessMenu] as string;
            return (
              <div key={mf.key} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 card-hover overflow-hidden" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className={`absolute -top-8 -right-8 w-24 h-24 ${mf.color} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500 blur-xl`} />
                <div className="relative flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl ${mf.color}/10`}>
                    <Icon className={`w-5 h-5 ${mf.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{mf.label}</h3>
                </div>
                <p className="relative text-sm text-slate-700 dark:text-slate-300">{value || '-'}</p>
              </div>
            );
          })}
          {selectedMenu.special && (
            <div className="lg:col-span-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-2xl p-4">
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Special: {selectedMenu.special}</p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Soup className="w-8 h-8" />}
          title="No menu for this day"
          description="Create a menu for the selected day"
        />
      )}

      {selectedMenu && (
        <div className="flex items-center gap-2">
          <button onClick={() => startEdit(selectedMenu)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
            <Edit3 className="w-4 h-4" /> Edit Menu
          </button>
          <button onClick={() => setDeleteTarget(selectedMenu)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}

      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="relative p-6 pb-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Soup className="w-4 h-4 text-orange-500" /> Full Week Menu
          </h3>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-500/10 to-slate-400/10">
                <th className="text-left py-3.5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Day</th>
                <th className="text-left py-3.5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Breakfast</th>
                <th className="text-left py-3.5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Lunch</th>
                <th className="text-left py-3.5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Snacks</th>
                <th className="text-left py-3.5 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Dinner</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((m, idx) => (
                <tr key={m.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${selectedDay === m.day ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}>
                  <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">{m.day}</td>
                  <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">{m.breakfast}</td>
                  <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">{m.lunch}</td>
                  <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">{m.snacks}</td>
                  <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">{m.dinner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Menu"
        message={`Are you sure you want to delete the menu for ${deleteTarget?.day}?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
