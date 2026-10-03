import request from 'supertest';

import { app } from '../../src/app.js';
import { sequelize } from '../../src/database/sequelize.js';

describe('Health endpoints', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(['/api/health', '/api/health/live'])(
    '%s responds without accessing the database',
    async (path) => {
      const authenticate = jest
        .spyOn(sequelize, 'authenticate')
        .mockRejectedValue(new Error('Database unavailable'));

      const response = await request(app).get(path).expect(200);

      expect(response.body).toEqual({ status: 'ok' });
      expect(authenticate).not.toHaveBeenCalled();
    },
  );

  it('returns ready when the database is available', async () => {
    const response = await request(app)
      .get('/api/health/ready')
      .expect(200);

    expect(response.body).toEqual({ status: 'ready' });
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('returns 503 when the database is unavailable', async () => {
    jest
      .spyOn(sequelize, 'authenticate')
      .mockRejectedValue(new Error('Private connection details'));

    const response = await request(app)
      .get('/api/health/ready')
      .expect(503);

    expect(response.body).toEqual({ status: 'not_ready' });
    expect(response.text).not.toContain('Private connection details');
  });
});