import { AppError } from './appError.js';

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super('UNAUTHORIZED', message);

    this.name = 'UnauthorizedError';
  }
}