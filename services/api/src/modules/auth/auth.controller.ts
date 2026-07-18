import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as authService from './auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendSuccess(res, result, 'Registration successful', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendSuccess(res, result, 'Login successful');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  const result = await authService.refreshToken(token);
  sendSuccess(res, result, 'Token refreshed');
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getProfile(req.user!.userId);
  sendSuccess(res, result);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  sendSuccess(res, result, 'Reset link sent if email exists');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);
  sendSuccess(res, result, 'Password reset successfully');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.updateProfile(req.user!.userId, req.body);
  sendSuccess(res, result, 'Profile updated');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user!.userId, oldPassword, newPassword);
  sendSuccess(res, result, 'Password changed successfully');
});

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.sendOtp(req.body.email);
  sendSuccess(res, result, 'OTP sent if email exists');
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await authService.verifyOtp(email, otp);
  sendSuccess(res, result, 'OTP verified');
});
