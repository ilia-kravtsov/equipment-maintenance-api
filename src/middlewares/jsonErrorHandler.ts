import type { ErrorRequestHandler } from 'express';

import { BadRequestError } from '../errors/badRequestError.js';

export const jsonErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  _res,
  next,
) => {
  if (
    error instanceof SyntaxError &&
    'body' in error
  ) {
    next(new BadRequestError('Malformed JSON body'));
    return;
  }

  next(error);
};