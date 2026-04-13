/**
 * JWT utility functions for access tokens, refresh tokens, and QR tokens.
 * Implements token rotation with separate secrets for each token type.
 */

import jwt from 'jsonwebtoken';
import { AuthError } from './AppError';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const QR_SECRET = process.env.JWT_QR_SECRET || 'dev-qr-secret';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface QRPayload {
  registrationId: string;
  userId: string;
  eventId: string;
}

/**
 * Generate a short-lived access token (15 minutes).
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

/**
 * Generate a refresh token stored in httpOnly cookie (7 days).
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

/**
 * Generate a signed QR code token for ticket verification.
 */
export function generateQRToken(payload: QRPayload): string {
  return jwt.sign(payload, QR_SECRET, { expiresIn: '30d' });
}

/**
 * Verify an access token and return payload.
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch {
    throw new AuthError('Invalid or expired access token');
  }
}

/**
 * Verify a refresh token and return payload.
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch {
    throw new AuthError('Invalid or expired refresh token');
  }
}

/**
 * Verify a QR token and return payload.
 */
export function verifyQRToken(token: string): QRPayload {
  try {
    return jwt.verify(token, QR_SECRET) as QRPayload;
  } catch {
    throw new AuthError('Invalid or expired QR token');
  }
}

/**
 * Generate a generic token for email verification / password reset.
 */
export function generateEmailToken(payload: { userId: string; purpose: string }): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '1h' });
}

/**
 * Verify an email token.
 */
export function verifyEmailToken(token: string): { userId: string; purpose: string } {
  try {
    return jwt.verify(token, ACCESS_SECRET) as { userId: string; purpose: string };
  } catch {
    throw new AuthError('Invalid or expired token');
  }
}
