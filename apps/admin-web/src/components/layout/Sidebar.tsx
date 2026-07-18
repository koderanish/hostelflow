import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { roleTheme } from '../../theme/roleTheme';
import {
  LayoutDashboard, Building2, Users, DoorOpen, FileText, CheckSquare, Wallet,
  ClipboardCheck, Calendar, Users2, AlertTriangle, UtensilsCrossed, Package,
  UserCog, Megaphone, BarChart3, Settings, User, Wrench, LogOut, X, Building,
  GraduationCap, Shield, Bell, ChevronLeft, ChevronRight,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Building2, Users, DoorOpen, FileText, CheckSquare, Wallet,
  ClipboardCheck, Calendar, Users2, AlertTriangle, UtensilsCrossed, Package,
  UserCog, Megaphone, BarChart3, Settings, User, Wrench, LogOut, Building,
  GraduationCap, Shield, Bell,
};

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: NavItem[];
  role: string;
}

const roleIcons: Record<string, React.ElementType> = {
  admin: Shield,
  student: GraduationCap,
  warden: Users,
  staff: Wrench,
};

export default function Sidebar({ activeTab, setActiveTab, navItems, role }: SidebarProps) {
  const { user, logout } = useAuth();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();
  const RoleIcon = roleIcons[role] || Building;

  const theme = roleTheme[role] || roleTheme.admin;

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const handleNav = (id: string) => {
    setActiveTab(id);
    closeMobile();
  };

  const sidebarWidth = isCollapsed ? 'w-[72px]' : 'w-[280px]';

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={closeMobile} />
      )}
      <aside className={`fixed top-0 left-0 h-full ${sidebarWidth} bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 z-50 transform transition-all duration-300 ease-out flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-xl`}>
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-500/5 to-transparent" />
          <div className={`relative flex items-center gap-3 h-16 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${theme.gradient} flex items-center justify-center shadow-lg shrink-0`}>
              <Building className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-bold text-slate-900 dark:text-white">HostelFlow</h1>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize flex items-center gap-1">
                    <RoleIcon className="w-3 h-3" />
                    {role}
                  </p>
                </div>
                <button onClick={closeMobile} className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item, idx) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{ animationDelay: `${idx * 30}ms` }}
                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 animate-fade-in ${isCollapsed ? 'justify-center' : ''} ${
                  isActive
                    ? `${isDark ? theme.activeTextDark : theme.activeTextLight} shadow-lg`
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className={`absolute inset-0 rounded-xl ${isDark ? theme.activeSidebarDark : theme.activeSidebarLight} animate-scale-in`} />
                )}
                <Icon className={`relative z-10 w-4 h-4 transition-transform duration-200 ${isActive ? `scale-110 ${isDark ? theme.activeIconDark : theme.activeIconLight}` : 'group-hover:scale-110'}`} />
                {!isCollapsed && <span className="relative z-10 truncate">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="relative p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-500/5 to-transparent pointer-events-none" />
          <button
            onClick={toggleCollapse}
            className="hidden md:flex relative w-full items-center justify-center gap-3 px-3 py-2 mb-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> <span>Collapse</span></>}
          </button>
          {!isCollapsed && (
            <div className="relative flex items-center gap-3 px-3 py-2 mb-2">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-r ${theme.avatar} flex items-center justify-center text-sm font-bold text-white shadow-md shrink-0`}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate capitalize">{role}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 shrink-0" />
            {!isCollapsed && <>Sign Out</>}
          </button>
        </div>
      </aside>
    </>
  );
}
