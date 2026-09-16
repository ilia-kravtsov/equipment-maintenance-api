import { AppError } from './appError.js';

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NOT_FOUND', message);

    this.name = 'NotFoundError';
  }
}
