import type { User, ApiResponse } from '../types';
import { mockApiCall } from '../api/client';
import { MOCK_USERS } from '../data';
import { generateId } from '../utils';

interface LoginResponse {
  user: User;
  token: string;
}

interface OtpResponse {
  token: string;
}

class AuthService {
  private users: User[] = MOCK_USERS as User[];

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, error: 'Invalid email or password' };
    const token = 'mock-jwt-' + btoa(JSON.stringify({ id: user.id, role: user.role }));
    const { password: _, ...safeUser } = user;
    return mockApiCall({ user: safeUser as User, token });
  }

  async register(data: {
    name: string; email: string; phone: string; password: string; role: string;
  }): Promise<ApiResponse<LoginResponse>> {
    const exists = this.users.find(u => u.email === data.email);
    if (exists) return { success: false, error: 'Email already registered' };
    const newUser: User = {
      id: generateId(), email: data.email, password: data.password,
      name: data.name, role: data.role as User['role'],
      phone: data.phone, isActive: true,
    };
    this.users.push(newUser);
    const token = 'mock-jwt-' + btoa(JSON.stringify({ id: newUser.id, role: newUser.role }));
    const { password: _, ...safeUser } = newUser;
    return mockApiCall({ user: safeUser as User, token });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const user = this.users.find(u => u.email === email);
    if (!user) return { success: false, error: 'No account found with this email' };
    return { success: true, message: 'Password reset link sent to your email' };
  }

  async resetPassword(_token: string, _password: string): Promise<ApiResponse> {
    return { success: true, message: 'Password reset successfully' };
  }

  async sendOtp(email: string): Promise<ApiResponse> {
    const user = this.users.find(u => u.email === email);
    if (!user) return { success: false, error: 'No account found' };
    return { success: true, message: 'OTP sent to your email' };
  }

  async verifyOtp(_email: string, _otp: string): Promise<ApiResponse<OtpResponse>> {
    return { success: true, data: { token: 'otp-verified-token' } };
  }

  async refreshToken(token: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const payload = JSON.parse(atob(token.replace('mock-jwt-', '')));
      const user = this.users.find(u => u.id === payload.id);
      if (!user) return { success: false, error: 'Session expired' };
      const newToken = 'mock-jwt-' + btoa(JSON.stringify({ id: user.id, role: user.role }));
      const { password: _, ...safeUser } = user;
      return mockApiCall({ user: safeUser as User, token: newToken });
    } catch {
      return { success: false, error: 'Invalid token' };
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };
    if (user.password !== currentPassword) return { success: false, error: 'Current password is incorrect' };
    user.password = newPassword;
    return { success: true, message: 'Password changed successfully' };
  }

  async updateProfile(userId: string, data: Partial<Pick<User, 'name' | 'email' | 'phone'>>): Promise<ApiResponse<User>> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };
    Object.assign(user, data);
    const { password: _, ...safeUser } = user;
    return mockApiCall(safeUser as User);
  }

  async getProfile(userId: string): Promise<ApiResponse<User>> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };
    const { password: _, ...safeUser } = user;
    return mockApiCall(safeUser as User);
  }
}

export const authService = new AuthService();
