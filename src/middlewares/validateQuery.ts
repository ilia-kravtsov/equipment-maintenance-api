import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

import {
  ValidationError,
  type ValidationErrorDetail,
} from '../errors/validationError.js';

export const validateQuery = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const details: ValidationErrorDetail[] = result.error.issues.map(
        (issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }),
      );

      next(new ValidationError('Query validation failed', details));
      return;
    }

    res.locals.validatedQuery = result.data;

    next();
  };
};