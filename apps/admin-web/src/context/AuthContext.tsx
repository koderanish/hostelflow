import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { authService } from '../services/auth.service';
import { STORAGE_KEYS } from '../constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; role?: string }>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  refreshSession: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.USER) || sessionStorage.getItem(STORAGE_KEYS.USER);
    const savedUser = localStorage.getItem('hostelflow_user_data') || sessionStorage.getItem('hostelflow_user_data');
    const expiry = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY) || sessionStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);

    if (savedToken && savedUser && expiry) {
      if (Date.now() > parseInt(expiry)) {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem('hostelflow_user_data');
        localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
        sessionStorage.removeItem(STORAGE_KEYS.USER);
        sessionStorage.removeItem('hostelflow_user_data');
        sessionStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
      } else {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<{ success: boolean; error?: string; role?: string }> => {
    const res = await authService.login(email, password);
    if (!res.success || !res.data) {
      return { success: false, error: res.error || 'Login failed' };
    }
    const { user: loggedInUser, token: newToken } = res.data;
    setUser(loggedInUser);
    setToken(newToken);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEYS.USER, newToken);
    storage.setItem('hostelflow_user_data', JSON.stringify(loggedInUser));
    const expiry = String(Date.now() + 24 * 60 * 60 * 1000);
    storage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiry);

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
    }

    return { success: true, role: loggedInUser.role };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('hostelflow_user_data');
    localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem('hostelflow_user_data');
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
  }, []);

  const hasRole = useCallback((roles: UserRole[]) => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  const refreshSession = useCallback(async () => {
    if (!token) return;
    const res = await authService.refreshToken(token);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      const storage = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEYS.USER, res.data.token);
      storage.setItem('hostelflow_user_data', JSON.stringify(res.data.user));
      storage.setItem(STORAGE_KEYS.SESSION_EXPIRY, String(Date.now() + 24 * 60 * 60 * 1000));
    } else {
      logout();
    }
  }, [token, logout]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    const storage = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) ? localStorage : sessionStorage;
    storage.setItem('hostelflow_user_data', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!user, loading,
      login, logout, hasRole, refreshSession, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
