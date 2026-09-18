import { AppError } from './appError.js';

export class WeatherServiceError extends AppError {
  constructor(message = 'Weather service is unavailable') {
    super('WEATHER_SERVICE_ERROR', message);
    this.name = 'WeatherServiceError';
  }
}

export class WeatherTimeoutError extends AppError {
  constructor(message = 'Weather service request timed out') {
    super('WEATHER_TIMEOUT', message);
    this.name = 'WeatherTimeoutError';
  }
}