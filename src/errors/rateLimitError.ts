import { AppError } from './appError.js';

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super('RATE_LIMIT_EXCEEDED', message);
    this.name = 'RateLimitError';
  }
}
