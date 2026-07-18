import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { inventoryService } from '../../services/inventory.service';
import { PageHeader } from '../../components/ui/PageHeader';
import { useNotify } from '../../context/NotificationContext';
import { Loader2 } from 'lucide-react';

const inventorySchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.enum(['Furniture', 'Electrical', 'Cleaning', 'Kitchen', 'Stationery', 'Other']),
  sku: z.string().optional(),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.string().min(1, 'Unit is required'),
  condition: z.enum(['New', 'Good', 'Damaged', 'Repair']),
  location: z.string().min(1, 'Location is required'),
  assignedTo: z.string().optional(),
  purchaseDate: z.string().optional(),
  vendor: z.string().optional(),
  cost: z.string().optional(),
  notes: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

export function AddInventoryPage() {
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const { register, handleSubmit, formState: { errors } } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      unit: 'Piece',
    },
  });

  const onSubmit = async (data: InventoryFormData) => {
    const res = await inventoryService.addItem({
      name: data.name,
      category: data.category,
      sku: data.sku || undefined,
      quantity: Number(data.quantity),
      unit: data.unit,
      condition: data.condition,
      location: data.location,
      assignedTo: data.assignedTo || undefined,
      purchaseDate: data.purchaseDate || undefined,
      vendor: data.vendor || undefined,
      cost: data.cost ? Number(data.cost) : undefined,
    });
    if (res.success) {
      addToast('Item added successfully', 'success');
      navigate('/admin/inventory');
    } else {
      addToast((res as any).error || 'Failed to add item', 'error');
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const errorClass = "text-xs text-rose-500 mt-1";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Add Inventory Item" description="Add a new item to inventory" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}>Item Name *</label>
              <input type="text" {...register('name')} placeholder="e.g. Ceiling Fan" className={inputClass} />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>SKU</label>
              <input type="text" {...register('sku')} placeholder="e.g. ELEC-CF-001" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Category *</label>
              <select {...register('category')} className={inputClass}>
                <option value="">Select category</option>
                <option value="Furniture">Furniture</option>
                <option value="Electrical">Electrical</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Stationery">Stationery</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className={errorClass}>{errors.category.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Quantity *</label>
              <input type="number" min={0} {...register('quantity')} placeholder="e.g. 50" className={inputClass} />
              {errors.quantity && <p className={errorClass}>{errors.quantity.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Unit *</label>
              <select {...register('unit')} className={inputClass}>
                <option value="Piece">Piece</option>
                <option value="Set">Set</option>
                <option value="Pair">Pair</option>
                <option value="Liter">Liter</option>
                <option value="Kg">Kg</option>
                <option value="Packet">Packet</option>
                <option value="Box">Box</option>
              </select>
              {errors.unit && <p className={errorClass}>{errors.unit.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Condition *</label>
              <select {...register('condition')} className={inputClass}>
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Damaged">Damaged</option>
                <option value="Repair">Repair</option>
              </select>
              {errors.condition && <p className={errorClass}>{errors.condition.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Location *</label>
              <input type="text" {...register('location')} placeholder="e.g. Boys Hostel A - Room 101" className={inputClass} />
              {errors.location && <p className={errorClass}>{errors.location.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Assigned To</label>
              <input type="text" {...register('assignedTo')} placeholder="e.g. Room A-101 / Student Name" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Purchase Date</label>
              <input type="date" {...register('purchaseDate')} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Vendor</label>
              <input type="text" {...register('vendor')} placeholder="e.g. Furniture World" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Cost</label>
              <input type="number" min={0} {...register('cost')} placeholder="e.g. 1500" className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Notes</label>
            <textarea {...register('notes')} rows={2} className={inputClass} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => navigate('/admin/inventory')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin hidden" />
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
