import { useAuth } from '../../context/AuthContext';
import { roleTheme } from '../../theme/roleTheme';
import type { RoleThemeKey } from '../../theme/roleTheme';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  role?: RoleThemeKey;
}

export function PrimaryButton({ children, role: overrideRole, className = '', ...props }: PrimaryButtonProps) {
  const { user } = useAuth();
  const roleKey = overrideRole || user?.role || 'admin';
  const theme = roleTheme[roleKey];

  return (
    <button
      className={`bg-gradient-to-r ${theme.button} hover:from-[var(--role-hover-from)] hover:to-[var(--role-hover-to)] text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        ['--role-hover-from' as string]: theme.button.split(' ')[0].replace('-600', '-500'),
        ['--role-hover-to' as string]: theme.button.split(' ')[1]?.replace('-600', '-500') || '',
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </button>
  );
}
