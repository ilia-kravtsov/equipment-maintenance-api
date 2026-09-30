import { AppError } from './appError.js';

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super('FORBIDDEN', message);

    this.name = 'ForbiddenError';
  }
}