import request from 'supertest';

import { app } from '../../src/app.js';
import type { AuthSessionResult } from '../../src/models/auth/auth.js';
import { assignTestTechnician } from '../helpers/assignTestTechnician.js';
import { createTestSession } from '../helpers/createTestSession.js';
import { TEST_API_KEY } from '../testConfig.js';

describe('Request assignees access control', () => {
  let admin: AuthSessionResult;
  let viewer: AuthSessionResult;
  let technician: AuthSessionResult;
  let equipmentId: string;
  let requestId: string;
  let technicianId: string;

  const getAssignees = async () => {
    const response = await request(app)
      .get(`/api/requests/${requestId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    return response.body.data.assignees;
  };

  beforeAll(async () => {
    admin = await createTestSession('admin');
    viewer = await createTestSession('viewer');
    technician = await createTestSession('technician');

    const response = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        name: 'Assignees access test equipment',
        type: 'sensor',
        serialNumber: 'ASSIGNEES-ACCESS-001',
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
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        equipmentId,
        title: 'Assignees access test request',
        priority: 'high',
      })
      .expect(201);

    requestId = response.body.data.id as string;
    technicianId = await assignTestTechnician(requestId);
  });

  describe.each(['replace', 'remove'] as const)('%s', (action) => {
    it.each([
      ['missing token', 401],
      ['API key only', 401],
      ['viewer', 403],
      ['technician', 403],
    ] as const)(
      'rejects %s without changing assignments',
      async (actor, expectedStatus) => {
        const before = await getAssignees();

        const operation =
          action === 'replace'
            ? request(app)
              .post(`/api/requests/${requestId}/assignees`)
              .send({
                assignees: [
                  { technicianId, role: 'lead', hours: 5 },
                ],
              })
            : request(app)
              .delete(
                `/api/requests/${requestId}/assignees/${technicianId}`,
              );

        if (actor === 'API key only') {
          operation.set('X-API-Key', TEST_API_KEY);
        } else if (actor === 'viewer' || actor === 'technician') {
          const session = actor === 'viewer' ? viewer : technician;
          operation.set('Authorization', `Bearer ${session.accessToken}`);
        }

        const response = await operation.expect(expectedStatus);

        expect(response.body.error.code).toBe(
          expectedStatus === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        );
        expect(await getAssignees()).toEqual(before);
      },
    );
  });

  it('allows admin to replace assignments', async () => {
    await request(app)
      .post(`/api/requests/${requestId}/assignees`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        assignees: [
          { technicianId, role: 'lead', hours: 5 },
        ],
      })
      .expect(204);

    const assignees = await getAssignees();

    expect(assignees).toHaveLength(1);
    expect(assignees[0]).toMatchObject({
      technicianId,
      role: 'lead',
      hours: 5,
    });
  });

  it('allows admin to remove an assignment', async () => {
    await request(app)
      .delete(`/api/requests/${requestId}/assignees/${technicianId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(204);

    expect(await getAssignees()).toEqual([]);
  });
});