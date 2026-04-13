/**
 * Schedule controller — fest schedule CRUD.
 */

import { Request, Response } from 'express';
import { prisma } from '../server';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../utils/AppError';

export const getSchedule = asyncHandler(async (_req: Request, res: Response) => {
  const schedule = await prisma.festSchedule.findMany({
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    include: {
      event: { select: { id: true, title: true, category: true, coverImage: true } },
    },
  });

  // Group by day
  const grouped = schedule.reduce((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<number, typeof schedule>);

  res.json({ success: true, data: grouped });
});

export const createScheduleSlot = asyncHandler(async (req: Request, res: Response) => {
  const slot = await prisma.festSchedule.create({ data: req.body });
  res.status(201).json({ success: true, data: slot });
});

export const updateScheduleSlot = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.festSchedule.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Schedule slot');

  const slot = await prisma.festSchedule.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({ success: true, data: slot });
});

export const deleteScheduleSlot = asyncHandler(async (req: Request, res: Response) => {
  await prisma.festSchedule.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: { message: 'Schedule slot deleted' } });
});
