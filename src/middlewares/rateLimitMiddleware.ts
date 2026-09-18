import { rateLimit } from 'express-rate-limit';

import { config } from '../config/index.js';
import { RateLimitError } from '../errors/rateLimitError.js';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  limit: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new RateLimitError());
  },
});