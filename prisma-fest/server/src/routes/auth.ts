/**
 * Auth routes — all authentication and account recovery endpoints.
 */

import { Router } from 'express';
import { register, login, logout, refreshToken, forgotPassword, resetPassword, verifyEmail } from '../controllers/auth';
import { validate } from '../middleware/validate';
import { authenticateToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../../../shared/schemas/auth';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authenticateToken, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.get('/verify-email/:token', verifyEmail);

export { router as authRoutes };
