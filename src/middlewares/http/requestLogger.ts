import type { Request, Response } from 'express';
import { pinoHttp } from 'pino-http';

import { logger } from '../../config/logger.js';
import {AppError} from "../../errors/appError.js";

const createLogObject = (
  req: Request,
  res: Response,
  value: Record<string, unknown>,
) => ({
  requestId: res.locals.requestId,
  method: req.method,
  path: req.originalUrl.split('?')[0],
  status: res.statusCode,
  durationMs: value.responseTime,
});

const isReadinessFailure = (req: Request, res: Response): boolean =>
  req.originalUrl.split('?')[0] === '/api/health/ready'
  && res.statusCode === 503;

export const requestLogger = pinoHttp<Request, Response>({
  logger,

  genReqId: (_req, res) => {
    return res.locals.requestId as string;
  },

  customLogLevel: (req, res, error) => {
    if (isReadinessFailure(req, res)) {
      return 'warn';
    }

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

  customErrorObject: (req, res, _error, value) => {
    const logObject = createLogObject(req, res, value);
    const applicationError = res.locals.error;

    return {
      ...logObject,
      ...(applicationError instanceof AppError
        ? { code: applicationError.code }
        : {}),
    };
  },

  customErrorMessage: (req, res) =>
    isReadinessFailure(req, res)
      ? 'Readiness check failed'
      : 'Request failed',
});