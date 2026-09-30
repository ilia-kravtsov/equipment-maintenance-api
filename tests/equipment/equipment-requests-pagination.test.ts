import request from 'supertest';

import { app } from '../../src/app.js';
import { TEST_API_KEY } from '../testConfig.js';

interface RequestItem {
  id: string;
  equipmentId: string;
  priority: string;
}

describe('Equipment requests pagination', () => {
  let equipmentId: string;
  let otherEquipmentId: string;
  let lowRequestId: string;
  let highRequestId: string;

  const createEquipment = async (serialNumber: string): Promise<string> => {
    const response = await request(app)
      .post('/api/equipment')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        name: 'Pagination test equipment',
        type: 'sensor',
        serialNumber,
        location: { lat: 55.7558, lon: 37.6173 },
        status: 'operational',
        installedAt: '2025-01-15',
      })
      .expect(201);

    return response.body.data.id as string;
  };

  const createRequest = async (
    targetEquipmentId: string,
    priority: 'low' | 'high',
  ): Promise<string> => {
    const response = await request(app)
      .post('/api/requests')
      .set('X-API-Key', TEST_API_KEY)
      .send({
        equipmentId: targetEquipmentId,
        title: `Pagination test request ${priority}`,
        priority,
      })
      .expect(201);

    return response.body.data.id as string;
  };

  beforeAll(async () => {
    equipmentId = await createEquipment('NESTED-PAGE-001');
    otherEquipmentId = await createEquipment('NESTED-PAGE-002');

    lowRequestId = await createRequest(equipmentId, 'low');
    highRequestId = await createRequest(equipmentId, 'high');
    await createRequest(otherEquipmentId, 'high');
  });

  it('returns separate pages in the requested order', async () => {
    const url = `/api/equipment/${equipmentId}/requests`;
    const query = { limit: 1, sortBy: 'priority', order: 'asc' };

    const first = await request(app)
      .get(url)
      .query({ ...query, page: 1 })
      .expect(200);

    const second = await request(app)
      .get(url)
      .query({ ...query, page: 2 })
      .expect(200);

    const third = await request(app)
      .get(url)
      .query({ ...query, page: 3 })
      .expect(200);

    expect(first.body.data).toHaveLength(1);
    expect(first.body.data[0].id).toBe(lowRequestId);

    expect(second.body.data).toHaveLength(1);
    expect(second.body.data[0].id).toBe(highRequestId);

    expect(third.body.data).toEqual([]);
  });

  it('filters requests by priority', async () => {
    const response = await request(app)
      .get(`/api/equipment/${equipmentId}/requests`)
      .query({ priority: 'high' })
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      id: highRequestId,
      equipmentId,
      priority: 'high',
    });
  });

  it('uses the equipment ID from the path instead of the query', async () => {
    const response = await request(app)
      .get(`/api/equipment/${equipmentId}/requests`)
      .query({ equipmentId: otherEquipmentId })
      .expect(200);

    const items = response.body.data as RequestItem[];

    expect(items).toHaveLength(2);
    expect(items.every((item) => item.equipmentId === equipmentId)).toBe(true);
    expect(items.map((item) => item.id).sort()).toEqual(
      [lowRequestId, highRequestId].sort(),
    );
  });

  it.each([
    { page: 0 },
    { limit: 101 },
    { page: 102, limit: 100 },
  ])('rejects invalid pagination %j', async (query) => {
    const response = await request(app)
      .get(`/api/equipment/${equipmentId}/requests`)
      .query(query)
      .expect(400);

    expect(response.body.error.code).toBe('BAD_REQUEST');
  });

  it('returns 404 for an unknown equipment ID', async () => {
    const response = await request(app)
      .get(
        '/api/equipment/00000000-0000-4000-8000-000000000001/requests',
      )
      .expect(404);

    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});