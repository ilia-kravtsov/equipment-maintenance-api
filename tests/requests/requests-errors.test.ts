import request from 'supertest';

import { app } from '../../src/app.js';
import { assignTestTechnician } from '../helpers/assignTestTechnician.js';
import { createTestSession } from '../helpers/createTestSession.js';

const createEquipment = async (serialNumber: string) => {
  const response = await request(app)
    .post('/api/equipment')
    .set('Authorization', `Bearer ${adminAccessToken}`)
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

let adminAccessToken: string;

beforeAll(async () => {
  const session = await createTestSession('admin');
  adminAccessToken = session.accessToken;
});

describe('Maintenance Requests API errors', () => {
  it('should return 422 for invalid maintenance request data', async () => {
    const response = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${adminAccessToken}`)
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
      .set('Authorization', `Bearer ${adminAccessToken}`)
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
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        equipmentId,
        title: 'Status transition test',
        priority: 'high',
      });

    expect(createResponse.status).toBe(201);

    const maintenanceRequestId = createResponse.body.data.id as string;
    await assignTestTechnician(maintenanceRequestId);

    await request(app)
      .patch(`/api/requests/${maintenanceRequestId}/status`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'in_progress' })
      .expect(200);

    await request(app)
      .patch(`/api/requests/${maintenanceRequestId}/status`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'done' })
      .expect(200);

    const response = await request(app)
      .patch(`/api/requests/${maintenanceRequestId}/status`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'in_progress' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });

  it('should return 409 when deleting equipment with an open request', async () => {
    const equipmentId = await createEquipment('OPEN-REQUEST-001');

    const createResponse = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        equipmentId,
        title: 'Open maintenance request',
        priority: 'critical',
      });

    expect(createResponse.status).toBe(201);

    const response = await request(app)
      .delete(`/api/equipment/${equipmentId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });
});