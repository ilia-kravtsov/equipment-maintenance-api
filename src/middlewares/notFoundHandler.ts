import type { RequestHandler } from 'express';

import { NotFoundError } from '../errors/notFoundError.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};
