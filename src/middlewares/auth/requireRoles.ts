import type { RequestHandler } from 'express';

import { ForbiddenError } from '../../errors/forbiddenError.js';
import { UnauthorizedError } from '../../errors/unauthorizedError.js';
import type { UserRole } from '../../models/auth/user.js';
import type { AuthLocals } from './requireAuth.js';

export const requireRoles = (
  ...allowedRoles: UserRole[]
): RequestHandler => {
  return (_req, res, next): void => {
    const locals: AuthLocals = res.locals;
    const user = locals.user;

    if (user === undefined) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
};