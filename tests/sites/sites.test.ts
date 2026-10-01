import { randomUUID } from 'node:crypto';
import request from 'supertest';

import { app } from '../../src/app.js';
import { createTestSession } from '../helpers/createTestSession.js';

describe('Sites API', () => {
  const tokens = { viewer: '', technician: '', admin: '' };
  const input = () => ({
    name: 'Test site',
    code: randomUUID(),
    region: 'Test region',
    latitude: 55.75,
    longitude: 37.61,
  });

  beforeAll(async () => {
    for (const role of ['viewer', 'technician', 'admin'] as const) {
      tokens[role] = (await createTestSession(role)).accessToken;
    }
  });

  it('supports admin CRUD', async () => {
    const body = input();
    const auth = `Bearer ${tokens.admin}`;
    const created = await request(app).post('/api/sites')
      .set('Authorization', auth).send(body).expect(201);
    const url = `/api/sites/${created.body.data.id}`;

    expect(created.headers.location).toBe(url);
    expect(created.body.data).toMatchObject(body);

    await request(app).patch(url).set('Authorization', auth)
      .send({ name: 'Updated site' }).expect(200);

    const details = await request(app).get(url)
      .set('Authorization', auth).expect(200);
    expect(details.body.data).toMatchObject({
      ...body, name: 'Updated site',
    });

    await request(app).delete(url).set('Authorization', auth).expect(204);
    await request(app).get(url).set('Authorization', auth).expect(404);
  });

  it.each(['viewer', 'technician', 'admin'] as const)(
    'allows %s to read sites',
    async (role) => {
      const created = await request(app).post('/api/sites')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(input()).expect(201);

      const auth = `Bearer ${tokens[role]}`;
      const list = await request(app).get('/api/sites')
        .set('Authorization', auth).expect(200);
      expect(list.body.data).toContainEqual(created.body.data);

      const details = await request(app)
        .get(`/api/sites/${created.body.data.id}`)
        .set('Authorization', auth).expect(200);
      expect(details.body.data).toEqual(created.body.data);
    },
  );

  it.each(['get', 'post', 'patch', 'delete'] as const)(
    'rejects anonymous %s',
    async (method) => {
      const url = ['patch', 'delete'].includes(method)
        ? `/api/sites/${randomUUID()}` : '/api/sites';
      await request(app)[method](url).expect(401);
    },
  );

  describe.each(['viewer', 'technician'] as const)('%s', (role) => {
    it.each(['post', 'patch', 'delete'] as const)(
      'cannot execute %s',
      async (method) => {
        const url = method === 'post'
          ? '/api/sites' : `/api/sites/${randomUUID()}`;
        const response = await request(app)[method](url)
          .set('Authorization', `Bearer ${tokens[role]}`).expect(403);
        expect(response.body.error.code).toBe('FORBIDDEN');
      },
    );
  });

  it('rejects invalid creation data and an empty update', async () => {
    const auth = `Bearer ${tokens.admin}`;
    await request(app).post('/api/sites').set('Authorization', auth)
      .send({ ...input(), latitude: 91 }).expect(422);

    const created = await request(app).post('/api/sites')
      .set('Authorization', auth).send(input()).expect(201);

    await request(app).patch(`/api/sites/${created.body.data.id}`)
      .set('Authorization', auth).send({}).expect(422);
  });
});