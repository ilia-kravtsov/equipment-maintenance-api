import { randomUUID } from 'node:crypto';
import request from 'supertest';

import { app } from '../../src/app.js';
import type { UserRole } from '../../src/models/auth/user.js';
import { testAdminSequelize } from '../database.js';
import { createTestSession } from '../helpers/createTestSession.js';
import { TEST_API_KEY } from '../testConfig.js';

describe('Reports access control', () => {
  const siteId = randomUUID();

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

    if (
      process.env.NODE_ENV !== 'test' ||
      testAdminSequelize.getDatabaseName() !== 'equipment_maintenance_test'
    ) {
      throw new Error('Test fixtures require the test database');
    }

    await testAdminSequelize.query(
      `INSERT INTO public.sites
         (id, name, code, region, latitude, longitude)
       VALUES ($id, $name, $code, $region, $latitude, $longitude)`,
      {
        bind: {
          id: siteId,
          name: 'Reports access test site',
          code: 'REPORTS-ACCESS-001',
          region: 'Test region',
          latitude: 55.7558,
          longitude: 37.6173,
        },
      },
    );
  });

  describe.each([
    ['site summary', `/api/sites/${siteId}/summary`],
    ['equipment load', '/api/reports/equipment-load'],
  ] as const)('%s', (_name, url) => {
    it('requires authentication', async () => {
      const response = await request(app)
        .get(url)
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects an API key without an access token', async () => {
      const response = await request(app)
        .get(url)
        .set('X-API-Key', TEST_API_KEY)
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects an invalid access token', async () => {
      const response = await request(app)
        .get(url)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it.each(['viewer', 'technician', 'admin'] as const)(
      'allows %s to read the report',
      async (role) => {
        const response = await request(app)
          .get(url)
          .set('Authorization', `Bearer ${tokens[role]}`)
          .expect(200);

        expect(response.body.data).toBeDefined();
      },
    );
  });
});