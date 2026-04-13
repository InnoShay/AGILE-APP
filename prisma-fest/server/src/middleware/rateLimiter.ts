/**
 * Rate limiting middleware for auth routes.
 * Prevents brute-force attacks on login/register endpoints.
 */

import rateLimit from 'express-rate-limit';

/** Rate limiter for authentication routes: max 10 requests per 15 minutes */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP. Please try again after 15 minutes.',
      code: 'RATE_LIMIT',
    },
  },
});

/** General API rate limiter: max 100 requests per minute */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please slow down.',
      code: 'RATE_LIMIT',
    },
  },
});
