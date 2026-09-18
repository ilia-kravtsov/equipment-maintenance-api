import type { Request, Response } from 'express';
import { pinoHttp } from 'pino-http';

import { logger } from '../config/logger.js';

export const requestLogger = pinoHttp<Request, Response>({
  logger,

  genReqId: (_req, res) => {
    return res.locals.requestId as string;
  },

  customLogLevel: (_req, res, error) => {
    if (error || res.statusCode >= 500) {
      return 'error';
    }

    if (res.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  },

  customProps: (req, res) => ({
    requestId: res.locals.requestId,
    method: req.method,
    path: req.originalUrl,
  }),
});