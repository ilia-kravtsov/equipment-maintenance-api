import type { ErrorRequestHandler } from 'express';
import { ValidationError } from '../errors/validationError.js';
import { AppError } from '../errors/appError.js';

const statusByErrorCode: Record<string, number> = {
  VALIDATION_ERROR: 422,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ValidationError) {
    res.status(422).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });

    return;
  }

  if (error instanceof AppError) {
    const status = statusByErrorCode[error.code] ?? 500;

    res.status(status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });

    return;
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    },
  });
};
