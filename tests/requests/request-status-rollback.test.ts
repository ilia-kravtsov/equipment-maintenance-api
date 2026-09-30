import request from 'supertest';

import { app } from '../../src/app.js';
import { sequelize } from '../../src/database/sequelize.js';
import { MaintenanceRequestModel } from '../../src/database/models/maintenanceRequestModel.js';
import { RequestStatusHistoryModel } from '../../src/database/models/requestStatusHistoryModel.js';
import { updateRequestStatus } from '../../src/repositories/postgres/requests/updateRequestStatus.js';
import { TEST_API_KEY } from '../testConfig.js';
import { assignTestTechnician } from '../helpers/assignTestTechnician.js';

describe('Request status transaction rollback', () => {
  it('restores the request when history insertion fails and permits a retry', async () => {
    const equipmentResponse = await request(app)
      .post('/api/equipment')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        name: 'Status rollback equipment',
        type: 'sensor',
        serialNumber: 'STATUS-ROLLBACK-001',
        location: { lat: 55.7558, lon: 37.6173 },
        status: 'operational',
        installedAt: '2025-01-15',
      })
      .expect(201);

    const createResponse = await request(app)
      .post('/api/requests')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        equipmentId: equipmentResponse.body.data.id as string,
        title: 'Test status transaction rollback',
        priority: 'high',
      })
      .expect(201);

    const requestId = createResponse.body.data.id as string;
    await assignTestTechnician(requestId);
    const before = await MaintenanceRequestModel.findByPk(requestId);
    expect(before).not.toBeNull();
    const historyCount = await RequestStatusHistoryModel.count({
      where: { requestId },
    });
    expect(historyCount).toBe(1);

    const historyInsert = jest.spyOn(RequestStatusHistoryModel, 'create')
      .mockRejectedValueOnce(new Error('Forced history insertion failure'));

    try {
      await expect(
        updateRequestStatus(sequelize, requestId, 'in_progress'),
      ).rejects.toThrow('Forced history insertion failure');
      expect(historyInsert).toHaveBeenCalledTimes(1);
    } finally {
      historyInsert.mockRestore();
    }

    const after = await MaintenanceRequestModel.findByPk(requestId);
    expect(after?.status).toBe('new');
    expect(after?.updatedAt.toISOString()).toBe(before?.updatedAt.toISOString());
    expect(await RequestStatusHistoryModel.count({ where: { requestId } }))
      .toBe(historyCount);

    const updated = await updateRequestStatus(sequelize, requestId, 'in_progress');
    expect(updated?.status).toBe('in_progress');
    expect(await RequestStatusHistoryModel.count({ where: { requestId } }))
      .toBe(historyCount + 1);
  });
});
