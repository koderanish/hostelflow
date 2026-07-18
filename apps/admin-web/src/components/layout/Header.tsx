import { Menu, Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { roleTheme } from '../../theme/roleTheme';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import { SearchBar } from './SearchBar';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  onSearchChange: (q: string) => void;
}

export default function Header({ onSearchChange }: HeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleMobile } = useSidebar();
  const roleThemeConfig = roleTheme[user?.role || 'admin'];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/60 px-4 md:px-8 flex items-center gap-4 shadow-sm">
      <button
        onClick={toggleMobile}
        className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mr-2">
        <Sparkles className={`w-4 h-4 ${roleThemeConfig.primary}`} />
        <span className={`hidden sm:inline text-[10px] font-medium uppercase tracking-widest ${roleThemeConfig.lightText}`}>
          {user?.role || 'Dashboard'} Panel
        </span>
      </div>

      <SearchBar value="" onChange={onSearchChange} />

      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
        >
          <div className="relative">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            ) : (
              <Moon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            )}
          </div>
        </button>

        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
