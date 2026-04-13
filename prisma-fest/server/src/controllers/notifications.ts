/**
 * Notifications controller — fetch, mark read.
 */

import { Request, Response } from 'express';
import { prisma } from '../server';
import { asyncHandler } from '../utils/asyncHandler';

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: req.user!.userId, isRead: false },
  });

  res.json({ success: true, data: { notifications, unreadCount } });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, isRead: false },
    data: { isRead: true },
  });

  res.json({ success: true, data: { message: 'All notifications marked as read' } });
});

export const markOneRead = asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });

  res.json({ success: true, data: { message: 'Notification marked as read' } });
});
