/**
 * PRISMA Fest — Express Application Setup
 * Configures middleware stack: security, parsing, logging, CORS, routes, error handling.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { eventRoutes } from './routes/events';
import { registrationRoutes } from './routes/registrations';
import { notificationRoutes } from './routes/notifications';
import { scheduleRoutes } from './routes/schedule';
import { feedbackRoutes } from './routes/feedback';
import { announcementRoutes } from './routes/announcements';
import { sponsorRoutes } from './routes/sponsors';
import { analyticsRoutes } from './routes/analytics';
import { logger } from './utils/logger';

const app = express();

// ─── Security ───
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ─── Stripe webhook route needs raw body (before JSON parser) ───
app.use('/api/registrations/stripe-webhook', express.raw({ type: 'application/json' }));

// ─── Parsing ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ───
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.http(message.trim()) },
}));

// ─── API Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── Health Check ───
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ─── Global Error Handler ───
app.use(errorHandler);

export { app };
