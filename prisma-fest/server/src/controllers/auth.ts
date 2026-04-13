/**
 * Auth controller — handles registration, login, logout, token refresh,
 * forgot password, reset password, and email verification.
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../server';
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailToken,
  verifyRefreshToken,
  verifyEmailToken,
} from '../utils/jwt';
import { storeRefreshToken, getStoredRefreshToken, invalidateRefreshToken } from '../utils/redis';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { AuthError, ConflictError, NotFoundError, ValidationError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * POST /api/auth/register
 * Create a new user account and send verification email.
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, studentId } = req.body;

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Generate verify token
  const verifyToken = generateEmailToken({ userId: '', purpose: 'verify' });

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      studentId: studentId || null,
      verifyToken,
    },
  });

  // Send verification email
  await sendVerificationEmail(email, name, verifyToken);

  res.status(201).json({
    success: true,
    data: {
      message: 'Account created. Please check your email to verify your account.',
      userId: user.id,
    },
  });
});

/**
 * POST /api/auth/login
 * Authenticate user and return access + refresh tokens.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthError('Invalid email or password');
  }

  // Check if banned
  if (user.isBanned) {
    throw new AuthError('Your account has been suspended. Contact support.');
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new AuthError('Invalid email or password');
  }

  // Generate tokens
  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in Redis
  await storeRefreshToken(user.id, refreshToken);

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  res.json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    },
  });
});

/**
 * POST /api/auth/logout
 * Invalidate refresh token and clear cookie.
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await invalidateRefreshToken(req.user.userId);
  }

  res.clearCookie('refreshToken');
  res.json({ success: true, data: { message: 'Logged out successfully' } });
});

/**
 * POST /api/auth/refresh-token
 * Issue new access token using the refresh token from cookie.
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    throw new AuthError('No refresh token provided');
  }

  // Verify the refresh token
  const payload = verifyRefreshToken(token);

  // Check if token is stored in Redis (not invalidated)
  const storedToken = await getStoredRefreshToken(payload.userId);
  if (!storedToken) {
    throw new AuthError('Refresh token has been invalidated');
  }

  // Check user still exists and is not banned
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.isBanned) {
    throw new AuthError('Account no longer valid');
  }

  // Generate new tokens (rotation)
  const newPayload = { userId: user.id, email: user.email, role: user.role };
  const newAccessToken = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);

  // Store new refresh token
  await storeRefreshToken(user.id, newRefreshToken);

  // Set new cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.json({
    success: true,
    data: { accessToken: newAccessToken },
  });
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email with token.
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if user exists
    res.json({ success: true, data: { message: 'If an account exists, a reset link has been sent.' } });
    return;
  }

  const resetToken = generateEmailToken({ userId: user.id, purpose: 'reset' });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExp: new Date(Date.now() + 3600000), // 1 hour
    },
  });

  await sendPasswordResetEmail(email, user.name, resetToken);

  res.json({ success: true, data: { message: 'If an account exists, a reset link has been sent.' } });
});

/**
 * POST /api/auth/reset-password/:token
 * Reset password using the token from email.
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  // Verify token
  const tokenPayload = verifyEmailToken(token);
  if (tokenPayload.purpose !== 'reset') {
    throw new ValidationError('Invalid reset token');
  }

  // Find user with matching token
  const user = await prisma.user.findFirst({
    where: {
      id: tokenPayload.userId,
      resetToken: token,
      resetTokenExp: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AuthError('Invalid or expired reset token');
  }

  // Hash new password and clear reset token
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExp: null,
    },
  });

  res.json({ success: true, data: { message: 'Password reset successfully. You can now log in.' } });
});

/**
 * GET /api/auth/verify-email/:token
 * Verify user email address.
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  const user = await prisma.user.findFirst({
    where: { verifyToken: token },
  });

  if (!user) {
    throw new NotFoundError('Invalid verification token');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verifyToken: null,
    },
  });

  res.json({ success: true, data: { message: 'Email verified successfully!' } });
});
