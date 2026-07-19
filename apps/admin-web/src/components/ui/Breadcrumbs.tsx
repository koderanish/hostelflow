import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const LABEL_MAP: Record<string, string> = {
  admin: 'Admin', student: 'Student', warden: 'Warden', staff: 'Staff',
  dashboard: 'Dashboard', hostels: 'Hostels', buildings: 'Buildings',
  rooms: 'Rooms', students: 'Students', applications: 'Applications',
  allocations: 'Allocations', fees: 'Fees', attendance: 'Attendance',
  leave: 'Leave', visitors: 'Visitors', complaints: 'Complaints',
  mess: 'Mess', inventory: 'Inventory', documents: 'Documents', notifications: 'Notifications',
  notices: 'Notices', reports: 'Reports', settings: 'Settings',
  profile: 'Profile', 'change-password': 'Change Password',
  application: 'Application', room: 'Room', payments: 'Payments',
  create: 'Create', edit: 'Edit',
};

export function Breadcrumbs() {
  const { pathname, state } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
      <Link to="/admin/dashboard" className="hover:text-brand-500 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const label = isLast && state?.name
          ? state.name
          : LABEL_MAP[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
        const href = '/' + segments.slice(0, i + 1).join('/');
        return (
          <span key={seg} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3" />
            {isLast ? (
              <span className="text-slate-600 dark:text-slate-300 font-medium">{label}</span>
            ) : (
              <Link to={href} className="hover:text-brand-500 transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
