import { AppError } from './appError.js';

export class BadRequestError extends AppError {
  constructor(message: string) {
    super('BAD_REQUEST', message);
    this.name = 'BadRequestError';
  }
}