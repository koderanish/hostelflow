import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

type Permission = 'create' | 'read' | 'update' | 'delete' | 'manage';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ['create', 'read', 'update', 'delete', 'manage'],
  warden: ['create', 'read', 'update'],
  staff: ['read', 'update'],
  student: ['read'],
};

interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { user } = useAuth();

  if (!user) return null;

  const permissions = ROLE_PERMISSIONS[user.role];
  if (!permissions.includes(permission)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
