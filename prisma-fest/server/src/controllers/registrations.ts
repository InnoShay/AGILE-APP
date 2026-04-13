/**
 * Registrations controller — event registration, Stripe payment, QR code, check-in.
 */

import { Request, Response } from 'express';
import { prisma } from '../server';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError, ConflictError, ValidationError, AppError } from '../utils/AppError';
import { createPaymentIntent, verifyWebhookSignature } from '../services/stripe';
import { generateTicketQR } from '../services/qrcode';
import { verifyQRToken } from '../utils/jwt';
import { broadcastCheckin, notifyUser } from '../services/socket';

/**
 * POST /api/registrations — Register for an event.
 */
export const createRegistration = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, ticketType } = req.body;
  const userId = req.user!.userId;

  // Check event exists and has capacity
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event');
  if (event.status === 'cancelled') throw new ValidationError('This event has been cancelled');
  if (event.registeredCount >= event.totalCapacity) throw new ValidationError('Event is full');

  // Check not already registered
  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) throw new ConflictError('You are already registered for this event');

  // Create registration
  const registration = await prisma.registration.create({
    data: {
      userId,
      eventId,
      ticketType: ticketType || 'general',
      paymentStatus: event.isFree ? 'completed' : 'pending',
    },
  });

  // Generate QR code
  const qrCode = await generateTicketQR(registration.id, userId, eventId);
  await prisma.registration.update({
    where: { id: registration.id },
    data: { qrCode },
  });

  // Update registered count
  await prisma.event.update({
    where: { id: eventId },
    data: { registeredCount: { increment: 1 } },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      title: 'Registration Confirmed!',
      body: `You've registered for "${event.title}".`,
      type: 'registration',
      eventId,
    },
  });

  // If paid, create Stripe payment intent
  let paymentData = null;
  if (!event.isFree && event.price > 0) {
    const vipMultiplier = ticketType === 'vip' ? 2 : 1;
    paymentData = await createPaymentIntent(
      event.price * vipMultiplier,
      { eventId, userId, registrationId: registration.id },
    );

    await prisma.registration.update({
      where: { id: registration.id },
      data: { paymentIntentId: paymentData.paymentIntentId },
    });
  }

  res.status(201).json({
    success: true,
    data: {
      registration: { ...registration, qrCode },
      payment: paymentData,
    },
  });
});

/**
 * GET /api/registrations/mine — Get current user's registrations.
 */
export const getMyRegistrations = asyncHandler(async (req: Request, res: Response) => {
  const registrations = await prisma.registration.findMany({
    where: { userId: req.user!.userId },
    include: {
      event: {
        select: {
          id: true, title: true, date: true, time: true, venue: true,
          coverImage: true, status: true, category: true,
        },
      },
    },
    orderBy: { registeredAt: 'desc' },
  });

  res.json({ success: true, data: registrations });
});

/**
 * GET /api/registrations/:id — Get registration details.
 */
export const getRegistration = asyncHandler(async (req: Request, res: Response) => {
  const registration = await prisma.registration.findUnique({
    where: { id: req.params.id },
    include: {
      event: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!registration) throw new NotFoundError('Registration');

  res.json({ success: true, data: registration });
});

/**
 * PATCH /api/registrations/:id/checkin — Check in a student via QR code.
 */
export const checkinRegistration = asyncHandler(async (req: Request, res: Response) => {
  const { qrToken } = req.body;

  // Verify QR token
  const qrPayload = verifyQRToken(qrToken);

  // Find registration
  const registration = await prisma.registration.findUnique({
    where: { id: qrPayload.registrationId },
    include: { event: true, user: { select: { id: true, name: true } } },
  });

  if (!registration) throw new NotFoundError('Registration');
  if (registration.checkedIn) throw new ConflictError('Already checked in');

  // Verify organizer owns the event
  if (registration.event.organizerId !== req.user!.userId && req.user!.role !== 'admin') {
    throw new ValidationError('You can only check in registrations for your events');
  }

  // Mark as checked in
  await prisma.registration.update({
    where: { id: registration.id },
    data: { checkedIn: true, checkedInAt: new Date() },
  });

  // Get total checked in count
  const totalCheckedIn = await prisma.registration.count({
    where: { eventId: registration.eventId, checkedIn: true },
  });

  // Broadcast check-in update
  broadcastCheckin(registration.eventId, {
    registrationId: registration.id,
    checkedIn: true,
    totalCheckedIn,
  });

  res.json({
    success: true,
    data: {
      message: `${registration.user.name} checked in successfully`,
      totalCheckedIn,
    },
  });
});

/**
 * POST /api/registrations/stripe-webhook — Handle Stripe payment webhooks.
 */
export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  let event;
  try {
    event = verifyWebhookSignature(req.body, signature);
  } catch (err) {
    throw new ValidationError('Invalid Stripe webhook signature');
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    const { registrationId } = paymentIntent.metadata;

    if (registrationId) {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { paymentStatus: 'completed' },
      });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as any;
    const { registrationId } = paymentIntent.metadata;

    if (registrationId) {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { paymentStatus: 'failed' },
      });
    }
  }

  res.json({ received: true });
});
