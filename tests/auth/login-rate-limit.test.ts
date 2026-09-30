import express from 'express';
import request from 'supertest';

import { getAuthConfig } from '../../src/config/auth.js';
import { AuthController } from '../../src/controllers/authController.js';
import { UnauthorizedError } from '../../src/errors/unauthorizedError.js';
import { errorHandler } from '../../src/middlewares/errors/errorHandler.js';
import { requestId } from '../../src/middlewares/http/requestId.js';
import { createRequireAuth } from '../../src/middlewares/auth/requireAuth.js';
import { PostgresRefreshSessionRepository } from '../../src/repositories/postgres/auth/postgresRefreshSessionRepository.js';
import { PostgresUserRepository } from '../../src/repositories/postgres/users/postgresUserRepository.js';
import { createAuthRouter } from '../../src/routes/authRoutes.js';
import { AuthService } from '../../src/services/authService.js';

describe('Login rate limiting', () => {
  it('returns 429 after the allowed number of failed login attempts', async () => {
    const service = new AuthService(
      new PostgresUserRepository(),
      new PostgresRefreshSessionRepository(),
    );

    const login = jest.spyOn(service, 'login').mockRejectedValue(
      new UnauthorizedError('Invalid email or password'),
    );

    const testApp = express();

    testApp.use(requestId);
    testApp.use(express.json());

    testApp.use(
      '/api/auth',
      createAuthRouter(
        new AuthController(service),
        createRequireAuth(service),
      ),
    );

    testApp.use(errorHandler);

    const credentials = {
      email: 'rate-limit@example.com',
      password: 'Wrong-password-123',
    };

    const limit = getAuthConfig().loginRateLimitMax;

    try {
      for (let attempt = 0; attempt < limit; attempt += 1) {
        await request(testApp)
          .post('/api/auth/login')
          .send(credentials)
          .expect(401);
      }

      const response = await request(testApp)
        .post('/api/auth/login')
        .send(credentials)
        .expect(429);

      expect(response.body.error).toEqual({
        code: 'RATE_LIMIT_EXCEEDED',
        message: expect.any(String),
        requestId: expect.any(String),
      });

      expect(response.headers['retry-after']).toBeDefined();
      expect(response.headers['cache-control']).toBe('no-store');

      expect(login).toHaveBeenCalledTimes(limit);

      await request(testApp)
        .post('/api/auth/logout')
        .expect(204);
    } finally {
      login.mockRestore();
    }
  });
});