import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';
import Sidebar from './Sidebar';
import Header from './Header';

const NAV_ITEMS: Record<string, { id: string; label: string; icon: string; path: string }[]> = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/admin/dashboard' },
    { id: 'students', label: 'Student', icon: 'Users', path: '/admin/students' },
    { id: 'hostels', label: 'Hostels', icon: 'Building2', path: '/admin/hostels' },
    { id: 'buildings', label: 'Buildings', icon: 'Building2', path: '/admin/buildings' },
    { id: 'rooms', label: 'Rooms', icon: 'DoorOpen', path: '/admin/rooms' },
    { id: 'applications', label: 'Applications', icon: 'FileText', path: '/admin/applications' },
    { id: 'allocations', label: 'Allocations', icon: 'CheckSquare', path: '/admin/allocations' },
    { id: 'fees', label: 'Fees Management', icon: 'Wallet', path: '/admin/fees' },
    { id: 'attendance', label: 'Attendance', icon: 'ClipboardCheck', path: '/admin/attendance' },
    { id: 'leaves', label: 'Leave Requests', icon: 'Calendar', path: '/admin/leaves' },
    { id: 'visitors', label: 'Visitors', icon: 'Users2', path: '/admin/visitors' },
    { id: 'complaints', label: 'Complaints', icon: 'AlertTriangle', path: '/admin/complaints' },
    { id: 'mess', label: 'Mess Management', icon: 'UtensilsCrossed', path: '/admin/mess' },
    { id: 'inventory', label: 'Inventory', icon: 'Package', path: '/admin/inventory' },
    { id: 'documents', label: 'Documents', icon: 'FileText', path: '/admin/documents' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', path: '/admin/notifications' },
    { id: 'staff', label: 'Staff Management', icon: 'UserCog', path: '/admin/staff' },
    { id: 'notices', label: 'Notices & Events', icon: 'Megaphone', path: '/admin/notices' },
    { id: 'reports', label: 'Reports', icon: 'BarChart3', path: '/admin/reports' },
    { id: 'settings', label: 'Settings', icon: 'Settings', path: '/admin/settings' },
  ],
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/student/dashboard' },
    { id: 'application', label: 'Hostel Application', icon: 'FileText', path: '/student/application' },
    { id: 'room', label: 'Room Details', icon: 'DoorOpen', path: '/student/room' },
    { id: 'payments', label: 'Fee Payments', icon: 'Wallet', path: '/student/payments' },
    { id: 'attendance', label: 'Attendance', icon: 'ClipboardCheck', path: '/student/attendance' },
    { id: 'leave', label: 'Leave Requests', icon: 'Calendar', path: '/student/leave' },
    { id: 'complaints', label: 'Complaints', icon: 'AlertTriangle', path: '/student/complaints' },
    { id: 'documents', label: 'Documents', icon: 'FileText', path: '/student/documents' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', path: '/student/notifications' },
    { id: 'profile', label: 'Profile', icon: 'User', path: '/student/profile' },
  ],
  warden: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/warden/dashboard' },
    { id: 'students', label: 'Students', icon: 'Users', path: '/warden/students' },
    { id: 'rooms', label: 'Rooms', icon: 'DoorOpen', path: '/warden/rooms' },
    { id: 'attendance', label: 'Attendance', icon: 'ClipboardCheck', path: '/warden/attendance' },
    { id: 'leave-approval', label: 'Leave Approval', icon: 'Calendar', path: '/warden/leave-approval' },
    { id: 'visitors', label: 'Visitors', icon: 'Users2', path: '/warden/visitors' },
    { id: 'complaints', label: 'Complaints', icon: 'AlertTriangle', path: '/warden/complaints' },
    { id: 'allocations', label: 'Allocations', icon: 'CheckSquare', path: '/warden/allocations' },
  ],
  staff: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/staff/dashboard' },
    { id: 'complaints', label: 'Complaints', icon: 'AlertTriangle', path: '/staff/complaints' },
    { id: 'inventory', label: 'Inventory', icon: 'Package', path: '/staff/inventory' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', path: '/staff/notifications' },
    { id: 'profile', label: 'Profile', icon: 'User', path: '/staff/profile' },
  ],
};

function LayoutShell() {
  const { user, isAuthenticated } = useAuth();
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role] || NAV_ITEMS.admin;
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  return (
    <div data-role={user.role} className="min-h-dvh bg-slate-50 dark:bg-neutral-950 flex transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab: string) => {
          const item = navItems.find(n => n.id === tab);
          if (item) navigate(item.path);
        }}
        navItems={navItems.map(n => ({ ...n, label: n.label }))}
        role={user.role}
      />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'md:pl-[72px]' : 'md:pl-[280px]'}`}>
        <Header onSearchChange={() => {}} />
        <main className="flex-1 p-4 md:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <LayoutShell />
      </SidebarProvider>
    </ThemeProvider>
  );
}
