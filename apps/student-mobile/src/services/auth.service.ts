import { api, setAuthToken } from '../api/client';
import type { ApiResponse } from './types';

export interface LoginData {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone: string;
    avatar?: string;
    isActive: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<ApiResponse<LoginData>> {
    try {
      const response = await api.post('/auth/login', { email, password });
      const res = response.data;
      if (res.success && res.data) {
        setAuthToken(res.data.accessToken);
        return { success: true, data: res.data };
      }
      return { success: false, error: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Login failed' };
    }
  }

  async register(data: RegisterPayload): Promise<ApiResponse<LoginData>> {
    try {
      const response = await api.post('/auth/register', data);
      const res = response.data;
      if (res.success && res.data) {
        if (res.data.accessToken) setAuthToken(res.data.accessToken);
        return { success: true, data: res.data };
      }
      return { success: false, error: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Registration failed' };
    }
  }

  async getProfile(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/auth/profile');
      const res = response.data;
      if (res.success) return { success: true, data: res.data };
      return { success: false, error: res.message || 'Failed to fetch profile' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to fetch profile' };
    }
  }
}

export const authService = new AuthService();
