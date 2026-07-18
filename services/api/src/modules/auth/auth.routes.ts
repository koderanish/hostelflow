import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/rateLimiter';
import * as controller from './auth.controller';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from './auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh-token', validate(refreshTokenSchema), controller.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/send-otp', validate(sendOtpSchema), controller.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), controller.verifyOtp);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

router.get('/profile', authenticate, controller.getProfile);
router.put('/profile', authenticate, controller.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);

export default router;
