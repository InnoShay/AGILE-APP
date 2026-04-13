/**
 * Role-based access control middleware.
 * Checks if the authenticated user has the required role(s).
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, AuthError } from '../utils/AppError';

/**
 * Middleware factory to require specific role(s).
 * Must be used after authenticateToken middleware.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Access denied. Required role: ${roles.join(' or ')}`);
    }

    next();
  };
}
