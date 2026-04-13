/**
 * JWT authentication middleware.
 * Validates access tokens from Authorization header and attaches user to request.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { AuthError } from '../utils/AppError';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT access tokens.
 * Expects: `Authorization: Bearer <token>`
 */
export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('No authentication token provided');
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);
  req.user = payload;
  next();
}

/**
 * Optional authentication — doesn't throw if no token, but attaches user if present.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = verifyAccessToken(token);
    } catch {
      // Token invalid, continue as unauthenticated
    }
  }
  next();
}
