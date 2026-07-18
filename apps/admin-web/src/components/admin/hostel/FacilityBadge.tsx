import { Wifi, Tv, ShowerHead, Car, Dumbbell, BookOpen, UtensilsCrossed, Wind, Warehouse, WashingMachine } from 'lucide-react';

const FACILITY_ICONS: Record<string, React.ElementType> = {
  'Laundry': WashingMachine, 'Gym': Dumbbell, 'Common Room': Tv,
  'Library': BookOpen, 'Kitchen': UtensilsCrossed, 'Parking': Car,
  'WiFi': Wifi, 'AC': Wind, 'Hot Water': ShowerHead, 'Generator': Warehouse,
};

interface FacilityBadgeProps {
  facility: string;
  onRemove?: () => void;
}

export function FacilityBadge({ facility, onRemove }: FacilityBadgeProps) {
  const Icon = FACILITY_ICONS[facility] || Warehouse;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
      <Icon className="w-3 h-3" />
      {facility}
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5 hover:text-red-500 transition-colors">&times;</button>
      )}
    </span>
  );
}
