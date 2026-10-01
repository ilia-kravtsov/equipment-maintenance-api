import request from 'supertest';

import { app } from '../../src/app.js';
import type { UserRole } from '../../src/models/auth/user.js';
import { createTestSession } from '../helpers/createTestSession.js';

describe('Maintenance request access control', () => {
  const tokens: Record<UserRole, string> = {
    viewer: '',
    technician: '',
    admin: '',
  };

  let equipmentId: string;
  let requestId: string;

  const requestBody = () => ({
    equipmentId,
    title: 'Request access test',
    priority: 'high',
  });

  const getRequest = async () => {
    const response = await request(app)
      .get(`/api/requests/${requestId}`)
      .set('Authorization', `Bearer ${tokens.admin}`)
      .expect(200);

    return response.body.data;
  };

  beforeAll(async () => {
    for (const role of ['viewer', 'technician', 'admin'] as const) {
      const session = await createTestSession(role);
      tokens[role] = session.accessToken;
    }

    const response = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        name: 'Request access test equipment',
        type: 'sensor',
        serialNumber: 'REQUEST-ACCESS-001',
        location: { lat: 55.7558, lon: 37.6173 },
        status: 'operational',
        installedAt: '2025-01-15',
      })
      .expect(201);

    equipmentId = response.body.data.id as string;
  });

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send(requestBody())
      .expect(201);

    requestId = response.body.data.id as string;
  });

  describe.each(['list', 'details', 'history'] as const)(
    'read %s',
    (resource) => {
      const getUrl = () => {
        if (resource === 'list') {
          return '/api/requests';
        }

        return resource === 'details'
          ? `/api/requests/${requestId}`
          : `/api/requests/${requestId}/history`;
      };

      it('requires authentication', async () => {
        const response = await request(app)
          .get(getUrl())
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });

      it.each(['viewer', 'technician', 'admin'] as const)(
        'allows %s',
        async (role) => {
          const response = await request(app)
            .get(getUrl())
            .set('Authorization', `Bearer ${tokens[role]}`)
            .expect(200);

          expect(response.body.data).toBeDefined();
        },
      );
    },
  );

  describe.each(['create', 'import', 'update', 'delete'] as const)(
    '%s',
    (action) => {
      const sendOperation = (token?: string) => {
        let operation;

        switch (action) {
          case 'create':
            operation = request(app)
              .post('/api/requests')
              .send(requestBody());
            break;

          case 'import':
            operation = request(app)
              .post('/api/requests/import')
              .send({ requests: [requestBody()] });
            break;

          case 'update':
            operation = request(app)
              .patch(`/api/requests/${requestId}`)
              .send({ title: 'Updated request access test' });
            break;

          case 'delete':
            operation = request(app)
              .delete(`/api/requests/${requestId}`);
            break;
        }

        if (token !== undefined) {
          operation.set('Authorization', `Bearer ${token}`);
        }

        return operation;
      };

      const getRequestCount = async (): Promise<number> => {
        const response = await request(app)
          .get('/api/requests')
          .set('Authorization', `Bearer ${tokens.admin}`)
          .query({ equipmentId, page: 1, limit: 1 })
          .expect(200);

        return response.body.meta.total as number;
      };

      it.each(['anonymous', 'viewer', 'technician', 'admin'] as const)(
        'checks access for %s',
        async (actor) => {
          const allowed =
            actor === 'admin' ||
            (actor === 'technician' && action !== 'delete');

          const token =
            actor === 'anonymous' ? undefined : tokens[actor];

          if (!allowed) {
            const before = await getRequest();
            const countBefore = await getRequestCount();
            const expectedStatus = actor === 'anonymous' ? 401 : 403;

            const response = await sendOperation(token)
              .expect(expectedStatus);

            expect(response.body.error.code).toBe(
              expectedStatus === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
            );

            expect(await getRequest()).toEqual(before);
            expect(await getRequestCount()).toBe(countBefore);
            return;
          }

          const expectedStatus =
            action === 'delete'
              ? 204
              : action === 'update'
                ? 200
                : 201;

          const response = await sendOperation(token)
            .expect(expectedStatus);

          switch (action) {
            case 'create':
              expect(response.body.data).toMatchObject({
                ...requestBody(),
                status: 'new',
              });
              break;

            case 'import':
              expect(response.body.data).toMatchObject({
                total: 1,
                created: 1,
                failed: 0,
              });
              break;

            case 'update':
              expect((await getRequest()).title).toBe(
                'Updated request access test',
              );
              break;

            case 'delete':
              await request(app)
                .get(`/api/requests/${requestId}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .expect(404);
              break;
          }
        },
      );
    },
  );
});