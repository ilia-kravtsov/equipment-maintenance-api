import { rateLimit } from 'express-rate-limit';

import { getAuthConfig } from '../../config/auth.js';
import { RateLimitError } from '../../errors/rateLimitError.js';

export const createLoginRateLimiter = () => {
  const config = getAuthConfig();

  return rateLimit({
    windowMs: config.loginRateLimitWindowMs,
    limit: config.loginRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (_req, _res, next) => {
      next(new RateLimitError());
    },
  });
};