import request from 'supertest';

import { app } from '../src/app.js';
import { TEST_API_KEY } from './testConfig.js';

describe('Maintenance Requests bulk import', () => {
  let equipmentId: string;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/equipment')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        name: 'Bulk Import Test Sensor',
        type: 'sensor',
        serialNumber: 'BULK-IMPORT-001',
        location: {
          lat: 55.7558,
          lon: 37.6173,
        },
        status: 'operational',
        installedAt: '2025-01-15',
      });

    expect(response.status).toBe(201);
    equipmentId = response.body.data.id as string;
  });

  it('should import all valid maintenance requests', async () => {
    const response = await request(app)
      .post('/api/requests/import')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        requests: [
          {
            equipmentId,
            title: 'Inspect sensor housing',
            priority: 'medium',
          },
          {
            equipmentId,
            title: 'Check sensor calibration',
            description: 'Verify readings against reference values',
            priority: 'high',
            plannedAt: '2026-10-01T10:00:00.000Z',
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.data.total).toBe(2);
    expect(response.body.data.created).toBe(2);
    expect(response.body.data.failed).toBe(0);
    expect(response.body.data.results).toHaveLength(2);

    expect(response.body.data.results[0]).toMatchObject({
      index: 0,
      status: 'created',
    });

    expect(response.body.data.results[1]).toMatchObject({
      index: 1,
      status: 'created',
    });

    expect(response.body.data.results[0].data.id).toEqual(expect.any(String));
    expect(response.body.data.results[1].data.id).toEqual(expect.any(String));
  });

  it('should partially import requests when one item is invalid', async () => {
    const response = await request(app)
      .post('/api/requests/import')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        requests: [
          {
            equipmentId,
            title: 'Inspect power connections',
            priority: 'high',
          },
          {
            equipmentId: 'invalid-id',
            title: 'Bad',
            priority: 'urgent',
          },
        ],
      });

    expect(response.status).toBe(207);
    expect(response.body.data.total).toBe(2);
    expect(response.body.data.created).toBe(1);
    expect(response.body.data.failed).toBe(1);

    expect(response.body.data.results[0]).toMatchObject({
      index: 0,
      status: 'created',
    });

    expect(response.body.data.results[1]).toMatchObject({
      index: 1,
      status: 'failed',
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      },
    });

    expect(response.body.data.results[1].error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'equipmentId',
        }),
      ]),
    );
  });

  it('should report missing equipment without aborting the import', async () => {
    const response = await request(app)
      .post('/api/requests/import')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        requests: [
          {
            equipmentId:
              '00000000-0000-4000-8000-000000000000',
            title: 'Inspect nonexistent equipment',
            priority: 'critical',
          },
          {
            equipmentId,
            title: 'Inspect existing equipment',
            priority: 'low',
          },
        ],
      });

    expect(response.status).toBe(207);
    expect(response.body.data.total).toBe(2);
    expect(response.body.data.created).toBe(1);
    expect(response.body.data.failed).toBe(1);

    expect(response.body.data.results[0]).toMatchObject({
      index: 0,
      status: 'failed',
      error: {
        code: 'NOT_FOUND',
        message: 'Equipment not found',
      },
    });

    expect(response.body.data.results[1]).toMatchObject({
      index: 1,
      status: 'created',
    });
  });

  it('should return 422 for an empty import', async () => {
    const response = await request(app)
      .post('/api/requests/import')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        requests: [],
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });

  it('should return 401 without an API key', async () => {
    const response = await request(app)
      .post('/api/requests/import')
      .send({
        requests: [
          {
            equipmentId,
            title: 'Unauthorized import request',
            priority: 'low',
          },
        ],
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });
});