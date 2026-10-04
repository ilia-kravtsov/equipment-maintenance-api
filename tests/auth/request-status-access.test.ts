import request from 'supertest';

import { app } from '../../src/app.js';
import type { AuthSessionResult } from '../../src/models/auth/auth.js';
import { assignTestTechnician } from '../helpers/assignTestTechnician.js';
import { createTestSession } from '../helpers/createTestSession.js';

describe('Request status access control', () => {
  let admin: AuthSessionResult;
  let viewer: AuthSessionResult;
  let unlinkedTechnician: AuthSessionResult;
  let otherTechnician: AuthSessionResult;
  let assignedTechnician: AuthSessionResult;

  let equipmentId: string;
  let requestId: string;

  const createRequest = async (): Promise<string> => {
    const response = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        equipmentId,
        title: 'Request status access test',
        priority: 'high',
      })
      .expect(201);

    return response.body.data.id as string;
  };

  const getHistory = async (id: string) => {
    const response = await request(app)
      .get(`/api/requests/${id}/history`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    return response.body.data;
  };

  beforeAll(async () => {
    admin = await createTestSession('admin');
    viewer = await createTestSession('viewer');
    unlinkedTechnician = await createTestSession('technician');

    const equipmentResponse = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        name: 'Status access test equipment',
        type: 'sensor',
        serialNumber: 'STATUS-ACCESS-001',
        location: { lat: 55.7558, lon: 37.6173 },
        status: 'operational',
        installedAt: '2025-01-15',
      })
      .expect(201);

    equipmentId = equipmentResponse.body.data.id as string;

    const otherRequestId = await createRequest();
    const otherTechnicianId = await assignTestTechnician(otherRequestId);

    otherTechnician = await createTestSession(
      'technician',
      otherTechnicianId,
    );
  });

  beforeEach(async () => {
    requestId = await createRequest();

    const technicianId = await assignTestTechnician(requestId);
    assignedTechnician = await createTestSession(
      'technician',
      technicianId,
    );
  });

  it.each([
    ['missing token', 401],
    ['viewer', 403],
    ['unlinked technician', 403],
    ['unassigned technician', 403],
  ] as const)(
    'rejects %s without changing the request or history',
    async (actor, expectedStatus) => {
      const historyBefore = await getHistory(requestId);

      const operation = request(app)
        .patch(`/api/requests/${requestId}/status`);

      if (actor !== 'missing token') {
        const session =
          actor === 'viewer'
            ? viewer
            : actor === 'unlinked technician'
              ? unlinkedTechnician
              : otherTechnician;

        operation.set('Authorization', `Bearer ${session.accessToken}`);
      }

      const response = await operation
        .send({ status: 'in_progress' })
        .expect(expectedStatus);

      expect(response.body.error.code).toBe(
        expectedStatus === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      );

      const details = await request(app)
        .get(`/api/requests/${requestId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);

      expect(details.body.data.status).toBe('new');
      expect(await getHistory(requestId)).toEqual(historyBefore);
    },
  );

  it.each(['assigned technician', 'admin'] as const)(
    'allows %s and records the author in history',
    async (actor) => {
      const session =
        actor === 'admin' ? admin : assignedTechnician;

      const historyBefore = await getHistory(requestId);

      const response = await request(app)
        .patch(`/api/requests/${requestId}/status`)
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(response.body.data.status).toBe('in_progress');

      const historyAfter = await getHistory(requestId);

      expect(historyAfter).toHaveLength(historyBefore.length + 1);
      expect(historyAfter).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            requestId,
            previousStatus: 'new',
            newStatus: 'in_progress',
            changedBy: session.user.id,
          }),
        ]),
      );
    },
  );
});