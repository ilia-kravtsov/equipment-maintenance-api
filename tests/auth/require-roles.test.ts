import express from 'express';
import request from 'supertest';

import type { AuthLocals } from '../../src/middlewares/auth/requireAuth.js';
import { requireRoles } from '../../src/middlewares/auth/requireRoles.js';
import { errorHandler } from '../../src/middlewares/errors/errorHandler.js';
import { requestId } from '../../src/middlewares/http/requestId.js';
import type { User, UserRole } from '../../src/models/auth/user.js';

const createUser = (role: UserRole): User => ({
  id: '2a458a72-4c66-48cb-a240-6f238d33088e',
  email: 'roles-test@example.com',
  role,
  technicianId: null,
  createdAt: '2026-09-30T00:00:00.000Z',
  updatedAt: '2026-09-30T00:00:00.000Z',
});

const createTestApp = (
  allowedRoles: UserRole[],
  user?: User,
) => {
  const app = express();
  const handler = jest.fn();

  app.use(requestId);

  app.use((_req, res, next) => {
    const locals: AuthLocals = res.locals;

    if (user !== undefined) {
      locals.user = user;
    }

    next();
  });

  app.get('/protected', requireRoles(...allowedRoles), (_req, res) => {
    handler();
    res.sendStatus(204);
  });

  app.use(errorHandler);

  return { app, handler };
};

describe('Role authorization middleware', () => {
  it('returns 401 when the user is missing', async () => {
    const { app, handler } = createTestApp(['admin']);

    const response = await request(app)
      .get('/protected')
      .expect(401);

    expect(response.body.error).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
      requestId: expect.any(String),
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it.each<UserRole>(['viewer', 'technician'])(
    'denies %s access to an admin-only route',
    async (role) => {
      const { app, handler } = createTestApp(
        ['admin'],
        createUser(role),
      );

      const response = await request(app)
        .get('/protected')
        .expect(403);

      expect(response.body.error).toEqual({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
        requestId: expect.any(String),
      });
      expect(handler).not.toHaveBeenCalled();
    },
  );

  it.each<UserRole>(['viewer', 'technician', 'admin'])(
    'allows an explicitly permitted %s role',
    async (role) => {
      const { app, handler } = createTestApp(
        [role],
        createUser(role),
      );

      await request(app).get('/protected').expect(204);

      expect(handler).toHaveBeenCalledTimes(1);
    },
  );

  it.each<UserRole>(['technician', 'admin'])(
    'allows %s when multiple roles are permitted',
    async (role) => {
      const { app, handler } = createTestApp(
        ['technician', 'admin'],
        createUser(role),
      );

      await request(app).get('/protected').expect(204);

      expect(handler).toHaveBeenCalledTimes(1);
    },
  );

  it('does not give admin an implicit bypass', async () => {
    const { app, handler } = createTestApp(
      ['technician'],
      createUser('admin'),
    );

    await request(app).get('/protected').expect(403);

    expect(handler).not.toHaveBeenCalled();
  });

  it.each<UserRole>(['viewer', 'technician', 'admin'])(
    'denies %s when no roles are permitted',
    async (role) => {
      const { app, handler } = createTestApp([], createUser(role));

      await request(app).get('/protected').expect(403);

      expect(handler).not.toHaveBeenCalled();
    },
  );
});