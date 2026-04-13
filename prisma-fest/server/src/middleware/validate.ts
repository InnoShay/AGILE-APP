/**
 * Zod schema validation middleware.
 * Validates request body, query, or params against a Zod schema.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/AppError';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Creates middleware that validates the specified request property against a Zod schema.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req[target]);
      // Replace with parsed (and potentially transformed) data
      (req as any)[target] = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        throw new ValidationError(messages);
      }
      throw error;
    }
  };
}
