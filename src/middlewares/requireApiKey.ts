import type { NextFunction, Request, Response } from 'express';
import { config } from '../config/index.js';
import { UnauthorizedError } from '../errors/unauthorizedError.js';

export const requireApiKey = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const apiKey = req.get('X-API-Key');

  if (apiKey !== config.apiKey) {
    next(new UnauthorizedError('Invalid or missing API key'));
    return;
  }

  next();
};