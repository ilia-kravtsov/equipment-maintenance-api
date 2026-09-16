import { AppError } from './appError.js';

export class PayloadTooLargeError extends AppError {
  constructor(message: string) {
    super('PAYLOAD_TOO_LARGE', message);
    this.name = 'PayloadTooLargeError';
  }
}
