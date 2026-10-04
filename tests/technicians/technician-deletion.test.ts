import { randomUUID } from 'node:crypto';
import request from 'supertest';

import { app } from '../../src/app.js';
import { ConflictError } from '../../src/errors/conflictError.js';
import { PostgresTechnicianRepository } from '../../src/repositories/postgres/technicians/postgresTechnicianRepository.js';
import { assignTestTechnician } from '../helpers/assignTestTechnician.js';
import { createTestSession } from '../helpers/createTestSession.js';

const repository = new PostgresTechnicianRepository();

describe('Technician deletion constraints', () => {
  it('preserves a technician linked to a user', async () => {
    const technician = await repository.create({
      fullName: 'Linked technician',
      specialization: 'Maintenance',
      employeeNumber: randomUUID(),
    });

    const session = await createTestSession('technician', technician.id);

    await expect(repository.delete(technician.id))
      .rejects.toBeInstanceOf(ConflictError);

    expect(await repository.findById(technician.id)).toEqual(technician);

    const response = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${session.accessToken}`).expect(200);
    expect(response.body.data.technicianId).toBe(technician.id);
  });

  it('preserves a technician assigned to a request', async () => {
    const session = await createTestSession('admin');
    const auth = `Bearer ${session.accessToken}`;

    const equipment = await request(app).post('/api/equipment')
      .set('Authorization', auth).send({
        name: 'Deletion test sensor',
        type: 'sensor',
        serialNumber: randomUUID(),
        location: { lat: 55.75, lon: 37.61 },
        status: 'operational',
        installedAt: '2025-01-15',
      }).expect(201);

    const created = await request(app).post('/api/requests')
      .set('Authorization', auth).send({
        equipmentId: equipment.body.data.id,
        title: 'Technician deletion test',
        priority: 'high',
      }).expect(201);

    const requestId = created.body.data.id as string;
    const technicianId = await assignTestTechnician(requestId);
    const before = await repository.findById(technicianId);

    await expect(repository.delete(technicianId))
      .rejects.toBeInstanceOf(ConflictError);

    expect(await repository.findById(technicianId)).toEqual(before);

    const details = await request(app).get(`/api/requests/${requestId}`)
      .set('Authorization', auth).expect(200);
    expect(details.body.data.assignees).toEqual(
      expect.arrayContaining([expect.objectContaining({ technicianId })]),
    );
  });
});