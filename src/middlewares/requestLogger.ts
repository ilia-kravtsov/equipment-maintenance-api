import type { Request, Response } from 'express';
import { pinoHttp } from 'pino-http';

import { logger } from '../config/logger.js';

const createLogObject = (
  req: Request,
  res: Response,
  value: Record<string, unknown>,
) => {
  const { responseTime, ...rest } = value;

  return {
    ...rest,
    requestId: res.locals.requestId,
    method: req.method,
    path: req.originalUrl,
    status: res.statusCode,
    durationMs: responseTime,
  };
};

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

  serializers: {
    req: () => undefined,
    res: () => undefined,
  },

  customSuccessObject: (req, res, value) =>
    createLogObject(req, res, value),

  customErrorObject: (req, res, _error, value) =>
    createLogObject(req, res, value),
});