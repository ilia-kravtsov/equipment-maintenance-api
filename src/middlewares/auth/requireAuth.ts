import type { RequestHandler } from 'express';

import { UnauthorizedError } from '../../errors/unauthorizedError.js';
import type { User } from '../../models/auth/user.js';
import type { AuthService } from '../../services/authService.js';

export interface AuthLocals {
  user?: User;
}

export const createRequireAuth = (
  authService: AuthService,
): RequestHandler => {
  return async (req, res, next): Promise<void> => {
    const authorization = req.get('Authorization');
    const match = authorization?.match(/^Bearer ([^\s]+)$/i);
    const token = match?.[1];

    if (token === undefined) {
      next(new UnauthorizedError('Missing or invalid Bearer token'));
      return;
    }

    try {
      const user = await authService.authenticate(token);

      const locals: AuthLocals = res.locals;
      locals.user = user;

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
};