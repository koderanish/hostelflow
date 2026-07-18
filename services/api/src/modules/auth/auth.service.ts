import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import config from '../../config';
import { ApiError } from '../../utils/apiResponse';

interface TokenPayload {
  userId: string;
  roleId: string;
  role: string;
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  avatar: string | null;
  isActive: boolean;
}

const mapUser = (user: any): UserResponse => ({
  id: user.id,
  email: user.email,
  name: user.fullName,
  phone: user.phone,
  role: user.role?.name?.toLowerCase() || 'student',
  avatar: user.avatar,
  isActive: user.status,
});

const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};

export const register = async (data: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ApiError(409, 'Email already registered');

  const roleName = data.role || 'STUDENT';
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new ApiError(400, `Role '${roleName}' not found`);

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      password: hashedPassword,
      roleId: role.id,
    },
    include: { role: true },
  });

  const tokens = generateTokens({
    userId: user.id,
    roleId: user.roleId,
    role: role.name,
  });

  return {
    user: mapUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) throw new ApiError(401, 'Invalid email or password');
  if (!user.status) throw new ApiError(403, 'Account is deactivated');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const tokens = generateTokens({
    userId: user.id,
    roleId: user.roleId,
    role: user.role.name,
  });

  return {
    user: mapUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

export const refreshToken = async (token: string) => {
  try {
    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });
    if (!user || !user.status) throw new ApiError(401, 'Invalid token');

    const tokens = generateTokens({
      userId: user.id,
      roleId: user.roleId,
      role: user.role.name,
    });

    return {
      user: mapUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      student: true,
      wardenHostels: true,
    },
  });

  if (!user) throw new ApiError(404, 'User not found');

  return {
    ...mapUser(user),
    student: user.student || undefined,
    hostels: user.wardenHostels || undefined,
  };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: 'If the email exists, a reset link has been sent.' };
  }
  return { message: 'If the email exists, a reset link has been sent.' };
};

export const resetPassword = async (token: string, newPassword: string) => {
  let decoded: { userId: string; type: string };
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret) as any;
  } catch {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  if (decoded.type !== 'password-reset') {
    throw new ApiError(400, 'Invalid reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: decoded.userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password reset successfully' };
};

export const updateProfile = async (userId: string, data: { name?: string; email?: string; phone?: string }) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user) throw new ApiError(404, 'User not found');

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ApiError(409, 'Email already in use');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { fullName: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
    },
    include: { role: true },
  });

  return mapUser(updated);
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new ApiError(400, 'Current password is incorrect');

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password changed successfully' };
};

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const sendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: 'If the email exists, an OTP has been sent.' };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  console.log(`[OTP] ${email}: ${otp}`);

  return { message: 'OTP sent successfully' };
};

export const verifyOtp = async (email: string, otp: string) => {
  const stored = otpStore.get(email);
  if (!stored) throw new ApiError(400, 'No OTP requested for this email');
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    throw new ApiError(400, 'OTP has expired');
  }
  if (stored.otp !== otp) throw new ApiError(400, 'Invalid OTP');

  otpStore.delete(email);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, 'User not found');

  const resetToken = jwt.sign(
    { userId: user.id, type: 'password-reset' },
    config.jwt.accessSecret,
    { expiresIn: '15m' } as jwt.SignOptions
  );

  return { token: resetToken };
};
