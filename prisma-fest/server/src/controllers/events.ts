/**
 * Events controller — CRUD, filtering, search, pagination, and event cancellation.
 */

import { Request, Response } from 'express';
import { prisma } from '../server';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError, ForbiddenError } from '../utils/AppError';
import { cacheGet, cacheSet, cacheDel } from '../utils/redis';
import { notifyEventCancelled, notifyUser } from '../services/socket';
import { sendEventCancelledEmail } from '../utils/email';
import { createStripeProduct } from '../services/stripe';
import { Prisma } from '@prisma/client';

/**
 * GET /api/events — Public: list events with filtering, search, sort, pagination.
 */
export const listEvents = asyncHandler(async (req: Request, res: Response) => {
  const { category, status, search, isFree, sortBy, sortOrder, page: pageStr, limit: limitStr } = req.query;
  const page = parseInt(pageStr as string) || 1;
  const limit = Math.min(parseInt(limitStr as string) || 12, 50);
  const skip = (page - 1) * limit;

  // Try cache first
  const cacheKey = `events:${JSON.stringify(req.query)}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    res.json({ success: true, data: cached });
    return;
  }

  // Build where clause
  const where: Prisma.EventWhereInput = { isApproved: true };
  if (category) where.category = category as any;
  if (status) where.status = status as any;
  if (isFree === 'true') where.isFree = true;
  if (isFree === 'false') where.isFree = false;
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { venue: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Build orderBy
  let orderBy: Prisma.EventOrderByWithRelationInput = { date: 'asc' };
  if (sortBy === 'popularity') orderBy = { registeredCount: sortOrder === 'asc' ? 'asc' : 'desc' };
  if (sortBy === 'price') orderBy = { price: sortOrder === 'asc' ? 'asc' : 'desc' };
  if (sortBy === 'date') orderBy = { date: sortOrder === 'desc' ? 'desc' : 'asc' };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where, skip, take: limit, orderBy,
      include: {
        organizer: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  const result = {
    events,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };

  // Cache for 60 seconds
  await cacheSet(cacheKey, result, 60);

  res.json({ success: true, data: result });
});

/**
 * GET /api/events/:id — Public: get event details.
 */
export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      organizer: { select: { id: true, name: true, avatarUrl: true } },
      schedule: { orderBy: { startTime: 'asc' } },
      feedback: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!event) throw new NotFoundError('Event');

  // Calculate average rating
  const avgRating = event.feedback.length > 0
    ? event.feedback.reduce((acc, f) => acc + f.rating, 0) / event.feedback.length
    : 0;

  res.json({ success: true, data: { ...event, averageRating: avgRating } });
});

/**
 * POST /api/events — Organizer: create a new event.
 */
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, category, venue, date, time, totalCapacity, isFree, price, coverImage } = req.body;

  let stripeProductId: string | null = null;
  let stripePriceId: string | null = null;

  // Create Stripe product if paid event
  if (!isFree && price > 0) {
    try {
      const { productId, priceId } = await createStripeProduct(title, price);
      stripeProductId = productId;
      stripePriceId = priceId;
    } catch {
      // Non-critical — payment can still work via payment intents
    }
  }

  const event = await prisma.event.create({
    data: {
      title, description, category, venue,
      date: new Date(date), time,
      totalCapacity, isFree,
      price: isFree ? 0 : (price || 0),
      coverImage: coverImage || null,
      organizerId: req.user!.userId,
      stripeProductId, stripePriceId,
    },
    include: {
      organizer: { select: { id: true, name: true } },
    },
  });

  // Invalidate events cache
  await cacheDel('events:*');

  res.status(201).json({ success: true, data: event });
});

/**
 * PUT /api/events/:id — Organizer/Admin: update event.
 */
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) throw new NotFoundError('Event');

  // Only owner or admin can edit
  if (event.organizerId !== req.user!.userId && req.user!.role !== 'admin') {
    throw new ForbiddenError('You can only edit your own events');
  }

  const updated = await prisma.event.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      ...(req.body.date && { date: new Date(req.body.date) }),
    },
    include: {
      organizer: { select: { id: true, name: true } },
    },
  });

  res.json({ success: true, data: updated });
});

/**
 * DELETE /api/events/:id — Organizer/Admin: delete event.
 */
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) throw new NotFoundError('Event');

  if (event.organizerId !== req.user!.userId && req.user!.role !== 'admin') {
    throw new ForbiddenError('You can only delete your own events');
  }

  await prisma.event.delete({ where: { id: req.params.id } });

  res.json({ success: true, data: { message: 'Event deleted' } });
});

/**
 * PATCH /api/events/:id/cancel — Cancel an event and notify registrants.
 */
export const cancelEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      registrations: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!event) throw new NotFoundError('Event');
  if (event.organizerId !== req.user!.userId && req.user!.role !== 'admin') {
    throw new ForbiddenError('Not authorized');
  }

  // Update event status
  await prisma.event.update({
    where: { id: req.params.id },
    data: { status: 'cancelled' },
  });

  // Notify all registered users
  const userIds = event.registrations.map((r) => r.user.id);
  notifyEventCancelled(userIds, { id: event.id, title: event.title });

  // Create notifications for each user
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title: 'Event Cancelled',
      body: `"${event.title}" has been cancelled.`,
      type: 'event_cancelled',
      eventId: event.id,
    })),
  });

  // Send emails
  for (const reg of event.registrations) {
    await sendEventCancelledEmail(reg.user.email, reg.user.name, event.title);
  }

  res.json({ success: true, data: { message: 'Event cancelled and all registrants notified' } });
});

/**
 * GET /api/events/:id/registrations — Organizer/Admin: list registrations for an event.
 */
export const getEventRegistrations = asyncHandler(async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) throw new NotFoundError('Event');

  if (event.organizerId !== req.user!.userId && req.user!.role !== 'admin') {
    throw new ForbiddenError('Not authorized');
  }

  const registrations = await prisma.registration.findMany({
    where: { eventId: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true, studentId: true, avatarUrl: true } },
    },
    orderBy: { registeredAt: 'desc' },
  });

  res.json({ success: true, data: registrations });
});
