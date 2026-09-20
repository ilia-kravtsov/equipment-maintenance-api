import request from 'supertest';

import { app } from '../src/app.js';
import { TEST_API_KEY } from './testConfig.js';

describe('Equipment API', () => {
  let equipmentId: string;

  describe('POST /api/equipment', () => {
    it('should create equipment', async () => {
      const equipment = {
        name: 'Main Turbine',
        type: 'turbine',
        serialNumber: 'TURBINE-TEST-001',
        location: {
          lat: 55.7558,
          lon: 37.6173,
        },
        status: 'operational',
        installedAt: '2025-01-15',
      };

      const response = await request(app)
        .post('/api/equipment')
        .set('X-API-Key', TEST_API_KEY)
        .send(equipment);

      equipmentId = response.body.data.id as string;

      expect(response.status).toBe(201);
      expect(response.headers.location).toBeDefined();

      expect(response.body.data).toMatchObject(equipment);
      expect(response.body.data.id).toEqual(expect.any(String));
    });
  });

  describe('GET /api/equipment/:id', () => {
    it('should return equipment by id', async () => {
      const response = await request(app)
        .get(`/api/equipment/${equipmentId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(equipmentId);
      expect(response.body.data.serialNumber).toBe('TURBINE-TEST-001');
    });
  });

  describe('PATCH /api/equipment/:id', () => {
    it('should update equipment', async () => {
      const response = await request(app)
        .patch(`/api/equipment/${equipmentId}`)
        .set('X-API-Key', TEST_API_KEY)
        .send({
          name: 'Updated Main Turbine',
          status: 'maintenance',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Main Turbine');
      expect(response.body.data.status).toBe('maintenance');
      expect(response.body.data.id).toBe(equipmentId);
    });
  });

  describe('GET /api/equipment', () => {
    it('should return paginated equipment list', async () => {
      const response = await request(app)
        .get('/api/equipment')
        .query({
          status: 'maintenance',
          page: 1,
          limit: 20,
        });

      expect(response.status).toBe(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: equipmentId,
            status: 'maintenance',
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

  describe('DELETE /api/equipment/:id', () => {
    it('should delete equipment', async () => {
      const response = await request(app)
        .set('X-API-Key', TEST_API_KEY)
        .delete(`/api/equipment/${equipmentId}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should return 404 for deleted equipment', async () => {
      const response = await request(app)
        .get(`/api/equipment/${equipmentId}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});