import request from 'supertest';

import { app } from '../src/app.js';

describe('Equipment API errors', () => {
  it('should return 422 for invalid equipment data', async () => {
    const response = await request(app)
      .post('/api/equipment')
      .send({
        name: 'AB',
        type: 'unknown',
        serialNumber: '',
        location: {
          lat: 100,
          lon: 200,
        },
        status: 'invalid',
        installedAt: 'not-a-date',
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.requestId).toEqual(expect.any(String));
    expect(Array.isArray(response.body.error.details)).toBe(true);
  });

  it('should return 404 for nonexistent equipment', async () => {
    const nonexistentId = '00000000-0000-4000-8000-000000000000';

    const response = await request(app)
      .get(`/api/equipment/${nonexistentId}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });

  it('should return 409 for duplicate serial number', async () => {
    const equipment = {
      name: 'Duplicate Test Sensor',
      type: 'sensor',
      serialNumber: 'DUPLICATE-TEST-001',
      location: {
        lat: 55.7558,
        lon: 37.6173,
      },
      status: 'operational',
      installedAt: '2025-02-10',
    };

    const firstResponse = await request(app)
      .post('/api/equipment')
      .send(equipment);

    expect(firstResponse.status).toBe(201);

    const secondResponse = await request(app)
      .post('/api/equipment')
      .send(equipment);

    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.error.code).toBe('CONFLICT');
    expect(secondResponse.body.error.requestId).toEqual(expect.any(String));
  });
});