import request from 'supertest';
import { app } from '../src/app.js';
import { TEST_API_KEY } from './testConfig.js';

const equipment = {
  name: 'Auth Test Sensor',
  type: 'sensor',
  serialNumber: 'AUTH-TEST-001',
  location: {
    lat: 55.7558,
    lon: 37.6173,
  },
  status: 'operational',
  installedAt: '2026-01-15',
};

describe('API key authentication', () => {
  it('should return 401 when API key is missing', async () => {
    const response = await request(app)
      .post('/api/equipment')
      .send(equipment);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(response.body.error.message).toBe('Invalid or missing API key');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });

  it('should return 401 when API key is invalid', async () => {
    const response = await request(app)
      .post('/api/equipment')
      .set('X-API-Key', 'invalid-api-key')
      .send(equipment);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });

  it('should allow request with valid API key', async () => {
    const response = await request(app)
      .post('/api/equipment')
      .set('X-API-Key', TEST_API_KEY)
      .send(equipment);

    expect(response.status).toBe(201);
    expect(response.body.data.serialNumber).toBe('AUTH-TEST-001');
  });

  it('should allow GET requests without API key', async () => {
    const response = await request(app).get('/api/equipment');

    expect(response.status).toBe(200);
  });
});