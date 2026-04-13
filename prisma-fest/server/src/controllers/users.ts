/**
 * Users controller — profile management, avatar upload, admin user management.
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../server';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError, AuthError, ValidationError } from '../utils/AppError';
import { uploadImage } from '../services/cloudinary';

/**
 * GET /api/users/me — Get current user profile.
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, name: true, email: true, role: true, avatarUrl: true,
      studentId: true, isVerified: true, createdAt: true,
    },
  });

  if (!user) throw new NotFoundError('User');

  res.json({ success: true, data: user });
});

/**
 * PUT /api/users/me — Update current user profile.
 */
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, studentId } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(studentId !== undefined && { studentId }),
    },
    select: {
      id: true, name: true, email: true, role: true, avatarUrl: true,
      studentId: true, isVerified: true, createdAt: true,
    },
  });

  res.json({ success: true, data: user });
});

/**
 * DELETE /api/users/me — Delete current user account.
 */
export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  await prisma.user.delete({ where: { id: req.user!.userId } });
  res.json({ success: true, data: { message: 'Account deleted successfully' } });
});

/**
 * POST /api/users/me/avatar — Upload avatar image.
 */
export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError('No image file provided');
  }

  const { url } = await uploadImage(req.file.buffer, 'prisma-fest/avatars', {
    width: 256, height: 256,
  });

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { avatarUrl: url },
    select: { id: true, avatarUrl: true },
  });

  res.json({ success: true, data: user });
});

/**
 * PUT /api/users/me/password — Change password.
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) throw new NotFoundError('User');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new AuthError('Current password is incorrect');

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });

  res.json({ success: true, data: { message: 'Password changed successfully' } });
});

/**
 * GET /api/users/:id — Admin: get user by ID.
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, name: true, email: true, role: true, avatarUrl: true,
      studentId: true, isVerified: true, isBanned: true, createdAt: true,
    },
  });

  if (!user) throw new NotFoundError('User');

  res.json({ success: true, data: user });
});

/**
 * GET /api/users — Admin: list all users with pagination.
 */
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const role = req.query.role as string;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (role) where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, avatarUrl: true,
        studentId: true, isVerified: true, isBanned: true, createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

/**
 * PATCH /api/users/:id/role — Admin: change user role.
 */
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;
  if (!['student', 'organizer', 'admin'].includes(role)) {
    throw new ValidationError('Invalid role');
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  res.json({ success: true, data: user });
});

/**
 * PATCH /api/users/:id/ban — Admin: ban/unban user.
 */
export const toggleBan = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new NotFoundError('User');

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isBanned: !user.isBanned },
    select: { id: true, name: true, email: true, isBanned: true },
  });

  res.json({ success: true, data: updated });
});
