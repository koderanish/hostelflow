import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginComponent from '../../components/auth/LoginPage';

export function LoginPage() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && user) {
    const redirectMap: Record<string, string> = {
      admin: '/admin/dashboard',
      student: '/student/dashboard',
      warden: '/warden/dashboard',
      staff: '/staff/dashboard',
    };
    return <Navigate to={redirectMap[user.role] || '/admin/dashboard'} replace />;
  }
  return <LoginComponent />;
}
