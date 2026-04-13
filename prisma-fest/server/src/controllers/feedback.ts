/**
 * Feedback controller — create and list event feedback.
 */

import { Request, Response } from 'express';
import { prisma } from '../server';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError, ConflictError, ValidationError } from '../utils/AppError';

export const createFeedback = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, rating, comment } = req.body;
  const userId = req.user!.userId;

  // Check event exists
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event');

  // Check user was registered
  const reg = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (!reg) throw new ValidationError('You must be registered for this event to leave feedback');

  // Check not already submitted
  const existing = await prisma.feedback.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) throw new ConflictError('You have already submitted feedback for this event');

  const feedback = await prisma.feedback.create({
    data: { userId, eventId, rating, comment },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  res.status(201).json({ success: true, data: feedback });
});

export const getEventFeedback = asyncHandler(async (req: Request, res: Response) => {
  const feedback = await prisma.feedback.findMany({
    where: { eventId: req.params.id },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const avgRating = feedback.length > 0
    ? feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length
    : 0;

  res.json({ success: true, data: { feedback, averageRating: avgRating, totalReviews: feedback.length } });
});
