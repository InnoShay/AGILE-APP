/**
 * Sponsors controller — admin CRUD, public listing.
 */

import { Request, Response } from 'express';
import { prisma } from '../server';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../utils/AppError';

export const listSponsors = asyncHandler(async (_req: Request, res: Response) => {
  const sponsors = await prisma.sponsor.findMany({
    orderBy: [{ tier: 'asc' }, { name: 'asc' }],
  });

  res.json({ success: true, data: sponsors });
});

export const createSponsor = asyncHandler(async (req: Request, res: Response) => {
  const sponsor = await prisma.sponsor.create({ data: req.body });
  res.status(201).json({ success: true, data: sponsor });
});

export const deleteSponsor = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.sponsor.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Sponsor');

  await prisma.sponsor.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: { message: 'Sponsor deleted' } });
});
