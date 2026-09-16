import { AppError } from './appError.js';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly details: ValidationErrorDetail[],
  ) {
    super('VALIDATION_ERROR', message);

    this.name = 'ValidationError';
  }
}