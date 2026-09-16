import type { RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ZodType } from 'zod';

import {
  ValidationError,
  type ValidationErrorDetail,
} from '../errors/validationError.js';

export const validateParams = <P extends ParamsDictionary = ParamsDictionary>(
  schema: ZodType,
): RequestHandler<P> => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const details: ValidationErrorDetail[] = result.error.issues.map(
        (issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }),
      );

      next(
        new ValidationError('Request parameters validation failed', details),
      );
      return;
    }

    req.params = result.data as P;
    next();
  };
};
