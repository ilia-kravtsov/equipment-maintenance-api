import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

import {
  ValidationError,
  type ValidationErrorDetail,
} from '../errors/validationError.js';
import { BadRequestError } from "../errors/badRequestError.js";

export const validateQuery = (
  schema: ZodType,
  errorStatus: 400 | 422 = 422,
): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const details: ValidationErrorDetail[] = result.error.issues.map(
        (issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }),
      );

      if (errorStatus === 400) {
        const message = details
          .map((detail) => `${detail.field}: ${detail.message}`)
          .join('; ');

        next(new BadRequestError(`Query validation failed: ${message}`));
        return;
      }

      next(new ValidationError('Query validation failed', details));
      return;
    }

    res.locals.validatedQuery = result.data;

    next();
  };
};
