import request from 'supertest';

import { app } from '../../src/app.js';
import type { UserRole } from '../../src/models/auth/user.js';
import { createTestSession } from '../helpers/createTestSession.js';
import { TEST_API_KEY } from '../testConfig.js';

const tokens: Record<UserRole, string> = {
  viewer: '',
  technician: '',
  admin: '',
};

beforeAll(async () => {
  for (const role of ['viewer', 'technician', 'admin'] as const) {
    const session = await createTestSession(role);
    tokens[role] = session.accessToken;
  }
});

describe('Equipment access control', () => {
  it('requires authentication for reading', async () => {
    const response = await request(app)
      .get('/api/equipment')
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('does not accept an API key instead of a Bearer token', async () => {
    const response = await request(app)
      .post('/api/equipment')
      .set('X-API-Key', TEST_API_KEY)
      .send({})
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it.each<UserRole>(['viewer', 'technician', 'admin'])(
    'allows %s to read equipment',
    async (role) => {
      await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${tokens[role]}`)
        .expect(200);
    },
  );

  describe.each(['viewer', 'technician'] as const)(
    '%s restrictions',
    (role) => {
      const id = '72d05fe8-6ce9-498e-ae46-0b9ce9ae0901';

      it.each(['post', 'patch', 'delete'] as const)(
        'rejects %s before validation or resource lookup',
        async (method) => {
          const path = method === 'post'
            ? '/api/equipment'
            : `/api/equipment/${id}`;

          const response = await request(app)
            [method](path)
            .set('Authorization', `Bearer ${tokens[role]}`)
            .send({})
            .expect(403);

          expect(response.body.error).toEqual({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
            requestId: expect.any(String),
          });
        },
      );
    },
  );
});