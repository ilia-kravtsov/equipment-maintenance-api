import type { ErrorRequestHandler } from 'express';

import { BadRequestError } from '../errors/badRequestError.js';
import { PayloadTooLargeError } from '../errors/payloadTooLargeError.js';

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

  if (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'entity.too.large'
  ) {
    next(
      new PayloadTooLargeError(
        'Request body exceeds the allowed size',
      ),
    );
    return;
  }

  next(error);
};