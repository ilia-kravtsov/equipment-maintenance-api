import type { RequestHandler } from 'express';
import { z } from 'zod';

import { BadRequestError } from '../errors/badRequestError.js';

const positiveInteger = z.string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().positive());

const paginationSchema = z.object({
  page: positiveInteger.pipe(z.number().max(10001)).default(1),
  limit: positiveInteger.pipe(z.number().max(100)).default(20),
}).refine(
  ({ page, limit }) => (page - 1) * limit <= 10000,
  {
    path: ['page'],
    message: 'Calculated offset must not exceed 10000',
  },
);

export const validatePagination: RequestHandler = (req, _res, next) => {
  const result = paginationSchema.safeParse(req.query);

  if (!result.success) {
    next(new BadRequestError(
      'Invalid pagination: page must be a positive integer, '
      + 'limit must be between 1 and 100, '
      + 'and calculated offset must not exceed 10000',
    ));
    return;
  }

  next();
};