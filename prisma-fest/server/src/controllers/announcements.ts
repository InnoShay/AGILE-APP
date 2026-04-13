/**
 * Announcements controller — admin create/delete, public list.
 */

import { Request, Response } from 'express';
import { prisma } from '../server';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../utils/AppError';
import { broadcastAnnouncement } from '../services/socket';

export const listAnnouncements = asyncHandler(async (_req: Request, res: Response) => {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { id: true, name: true } } },
  });

  res.json({ success: true, data: announcements });
});

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { title, body, priority } = req.body;

  const announcement = await prisma.announcement.create({
    data: {
      title, body,
      priority: priority || 'normal',
      createdById: req.user!.userId,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  });

  // Broadcast via Socket.io
  broadcastAnnouncement({
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    priority: announcement.priority,
  });

  res.status(201).json({ success: true, data: announcement });
});

export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.announcement.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Announcement');

  await prisma.announcement.delete({ where: { id: req.params.id } });

  res.json({ success: true, data: { message: 'Announcement deleted' } });
});
