/**
 * Analytics controller — admin overview and organizer event analytics.
 */

import { Request, Response } from 'express';
import { prisma } from '../server';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError, ForbiddenError } from '../utils/AppError';

/**
 * GET /api/analytics/overview — Admin: platform-wide analytics.
 */
export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalEvents, totalRegistrations, revenueResult] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.registration.count(),
    prisma.event.aggregate({ _sum: { price: true }, where: { isFree: false } }),
  ]);

  // Registrations per event (top 10)
  const eventsWithRegs = await prisma.event.findMany({
    select: { id: true, title: true, registeredCount: true, category: true },
    orderBy: { registeredCount: 'desc' },
    take: 10,
  });

  // Registrations over time (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const regsOverTime = await prisma.registration.groupBy({
    by: ['registeredAt'],
    _count: true,
    where: { registeredAt: { gte: thirtyDaysAgo } },
    orderBy: { registeredAt: 'asc' },
  });

  // Category distribution
  const categoryDist = await prisma.event.groupBy({
    by: ['category'],
    _count: true,
  });

  // Users by role
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      totalEvents,
      totalRegistrations,
      totalRevenue: revenueResult._sum.price || 0,
      eventsWithRegs,
      regsOverTime: regsOverTime.map((r) => ({
        date: r.registeredAt.toISOString().split('T')[0],
        count: r._count,
      })),
      categoryDistribution: categoryDist.map((c) => ({
        category: c.category,
        count: c._count,
      })),
      usersByRole: usersByRole.map((u) => ({
        role: u.role,
        count: u._count,
      })),
    },
  });
});

/**
 * GET /api/analytics/events/:id — Organizer: event-specific analytics.
 */
export const getEventAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      registrations: { include: { user: { select: { name: true } } } },
      feedback: true,
    },
  });

  if (!event) throw new NotFoundError('Event');
  if (event.organizerId !== req.user!.userId && req.user!.role !== 'admin') {
    throw new ForbiddenError('Not authorized');
  }

  const checkedInCount = event.registrations.filter((r) => r.checkedIn).length;
  const avgRating = event.feedback.length > 0
    ? event.feedback.reduce((acc, f) => acc + f.rating, 0) / event.feedback.length
    : 0;

  // Registrations per day
  const regsByDay = event.registrations.reduce((acc, r) => {
    const day = r.registeredAt.toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    success: true,
    data: {
      totalRegistrations: event.registrations.length,
      checkedInCount,
      checkInRate: event.registrations.length > 0 ? (checkedInCount / event.registrations.length) * 100 : 0,
      averageRating: avgRating,
      totalFeedback: event.feedback.length,
      capacityUtilization: (event.registeredCount / event.totalCapacity) * 100,
      registrationsByDay: Object.entries(regsByDay).map(([date, count]) => ({ date, count })),
      ratingDistribution: [1, 2, 3, 4, 5].map((star) => ({
        stars: star,
        count: event.feedback.filter((f) => f.rating === star).length,
      })),
    },
  });
});
