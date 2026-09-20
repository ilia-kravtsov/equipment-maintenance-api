import request from 'supertest';

import { app } from '../src/app.js';
import { TEST_API_KEY } from './testConfig.js';

const createEquipment = async (serialNumber: string) => {
  const response = await request(app)
    .post('/api/equipment')
    .set('X-API-Key', TEST_API_KEY)
    .send({
      name: 'Request Error Test Equipment',
      type: 'sensor',
      serialNumber,
      location: {
        lat: 55.7558,
        lon: 37.6173,
      },
      status: 'operational',
      installedAt: '2025-01-15',
    });

  expect(response.status).toBe(201);

  return response.body.data.id as string;
};

describe('Maintenance Requests API errors', () => {
  it('should return 422 for invalid maintenance request data', async () => {
    const response = await request(app)
      .post('/api/requests')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        equipmentId: 'invalid-id',
        title: 'Bad',
        priority: 'urgent',
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.requestId).toEqual(expect.any(String));
    expect(Array.isArray(response.body.error.details)).toBe(true);
  });

  it('should return 404 when equipment does not exist', async () => {
    const response = await request(app)
      .post('/api/requests')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        equipmentId: '00000000-0000-4000-8000-000000000000',
        title: 'Inspect nonexistent equipment',
        priority: 'high',
      });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });

  it('should return 409 for invalid status transition', async () => {
    const equipmentId = await createEquipment('STATUS-CONFLICT-001');

    const createResponse = await request(app)
      .post('/api/requests')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        equipmentId,
        title: 'Status transition test',
        priority: 'high',
      });

    expect(createResponse.status).toBe(201);

    const maintenanceRequestId = createResponse.body.data.id as string;

    await request(app)
      .patch(`/api/requests/${maintenanceRequestId}/status`)
      .set('X-API-Key', TEST_API_KEY)
      .send({ status: 'in_progress' })
      .expect(200);

    await request(app)
      .patch(`/api/requests/${maintenanceRequestId}/status`)
      .set('X-API-Key', TEST_API_KEY)
      .send({ status: 'done' })
      .expect(200);

    const response = await request(app)
      .patch(`/api/requests/${maintenanceRequestId}/status`)
      .set('X-API-Key', TEST_API_KEY)
      .send({ status: 'in_progress' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });

  it('should return 409 when deleting equipment with an open request', async () => {
    const equipmentId = await createEquipment('OPEN-REQUEST-001');

    const createResponse = await request(app)
      .post('/api/requests')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        equipmentId,
        title: 'Open maintenance request',
        priority: 'critical',
      });

    expect(createResponse.status).toBe(201);

    const response = await request(app)
      .delete(`/api/equipment/${equipmentId}`)
      .set('X-API-Key', TEST_API_KEY)

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });
});