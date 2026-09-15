import { AppError } from './appError.js';

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message);

    this.name = 'ConflictError';
  }
}