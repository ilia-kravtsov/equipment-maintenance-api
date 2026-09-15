import type { ErrorRequestHandler } from 'express';

import { AppError } from '../errors/appError.js';

const statusByErrorCode: Record<string, number> = {
  NOT_FOUND: 404,
  CONFLICT: 409,
};

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
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