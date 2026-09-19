import type { ErrorRequestHandler } from 'express';
import { ValidationError } from '../errors/validationError.js';
import { AppError } from '../errors/appError.js';
import { logger } from '../config/logger.js';

const statusByErrorCode: Record<string, number> = {
  WEATHER_SERVICE_ERROR: 502,
  WEATHER_TIMEOUT: 504,
  PAYLOAD_TOO_LARGE: 413,
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 422,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT_EXCEEDED: 429,
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ValidationError) {
    res.status(422).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId: res.locals.requestId,
      },
    });

    return;
  }

  if (error instanceof AppError) {
    const status = statusByErrorCode[error.code] ?? 500;

    if (status >= 500) {
      res.locals.error = error;
    }

    res.status(status).json({
      error: {
        code: error.code,
        message: error.message,
        requestId: res.locals.requestId,
      },
    });

    return;
  }

  res.locals.error = error;

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      requestId: res.locals.requestId,
    },
  });
};
