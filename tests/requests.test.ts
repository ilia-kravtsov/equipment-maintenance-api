import request from 'supertest';

import { app } from '../src/app.js';
import { TEST_API_KEY } from './testConfig.js';

describe('Maintenance Requests API', () => {
  let equipmentId: string;
  let requestId: string;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/equipment')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        name: 'Request Test Turbine',
        type: 'turbine',
        serialNumber: 'REQUEST-TEST-001',
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

  describe('POST /api/requests', () => {
    it('should create a maintenance request', async () => {
      const maintenanceRequest = {
        equipmentId,
        title: 'Inspect turbine bearings',
        description: 'Check bearings for abnormal vibration',
        priority: 'high',
        plannedAt: '2026-10-01T10:00:00.000Z',
      };

      const response = await request(app)
        .post('/api/requests')
        .set('X-API-Key', TEST_API_KEY)
        .send(maintenanceRequest);

      expect(response.status).toBe(201);
      expect(response.headers.location).toBeDefined();

      expect(response.body.data).toMatchObject({
        ...maintenanceRequest,
        status: 'new',
      });

      expect(response.body.data.id).toEqual(expect.any(String));
      expect(response.body.data.createdAt).toEqual(expect.any(String));
      expect(response.body.data.updatedAt).toEqual(expect.any(String));

      requestId = response.body.data.id as string;
    });
  });

  describe('GET /api/requests/:id', () => {
    it('should return maintenance request by id', async () => {
      const response = await request(app)
        .get(`/api/requests/${requestId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(requestId);
      expect(response.body.data.equipmentId).toBe(equipmentId);
      expect(response.body.data.status).toBe('new');
    });
  });

  describe('PATCH /api/requests/:id', () => {
    it('should update maintenance request', async () => {
      const response = await request(app)
        .patch(`/api/requests/${requestId}`)
        .set('X-API-Key', TEST_API_KEY)
        .send({
          title: 'Inspect turbine bearings and rotor',
          priority: 'critical',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(requestId);
      expect(response.body.data.title).toBe(
        'Inspect turbine bearings and rotor',
      );
      expect(response.body.data.priority).toBe('critical');
    });
  });

  describe('GET /api/requests', () => {
    it('should return filtered paginated request list', async () => {
      const response = await request(app)
        .get('/api/requests')
        .set('X-API-Key', TEST_API_KEY)
        .query({
          equipmentId,
          priority: 'critical',
          page: 1,
          limit: 20,
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: requestId,
            equipmentId,
            priority: 'critical',
          }),
        ]),
      );

      expect(response.body.meta).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 20,
        }),
      );

      expect(response.body.meta.total).toEqual(expect.any(Number));
    });
  });

  describe('GET /api/equipment/:id/requests', () => {
    it('should return requests for specific equipment', async () => {
      const response = await request(app)
        .get(`/api/equipment/${equipmentId}/requests`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: requestId,
            equipmentId,
          }),
        ]),
      );
    });
  });

  describe('PATCH /api/requests/:id/status', () => {
    it('should change status from new to in_progress', async () => {
      const response = await request(app)
        .patch(`/api/requests/${requestId}/status`)
        .set('X-API-Key', TEST_API_KEY)
        .send({
          status: 'in_progress',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(requestId);
      expect(response.body.data.status).toBe('in_progress');
    });

    it('should change status from in_progress to done', async () => {
      const response = await request(app)
        .patch(`/api/requests/${requestId}/status`)
        .set('X-API-Key', TEST_API_KEY)
        .send({
          status: 'done',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(requestId);
      expect(response.body.data.status).toBe('done');
    });
  });

  describe('DELETE /api/requests/:id', () => {
    it('should delete maintenance request', async () => {
      const response = await request(app)
        .delete(`/api/requests/${requestId}`)
        .set('X-API-Key', TEST_API_KEY)

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should return 404 for deleted maintenance request', async () => {
      const response = await request(app)
        .get(`/api/requests/${requestId}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});