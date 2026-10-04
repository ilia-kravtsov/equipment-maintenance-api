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

  it('times out shared readiness checks and then recovers', async () => {
    let completeCheck!: () => void;

    const authenticate = jest
      .spyOn(sequelize, 'authenticate')
      .mockImplementationOnce(() => new Promise<void>((resolve) => {
        completeCheck = resolve;
      }));

    try {
      const responses = await Promise.all([
        request(app).get('/api/health/ready').timeout(3500),
        request(app).get('/api/health/ready').timeout(3500),
      ]);

      for (const response of responses) {
        expect(response.status).toBe(503);
        expect(response.body).toEqual({ status: 'not_ready' });
      }

      expect(authenticate).toHaveBeenCalledTimes(1);
    } finally {
      completeCheck?.();
    }

    authenticate.mockResolvedValue(undefined);

    await request(app).get('/api/health/ready').expect(200);
    expect(authenticate).toHaveBeenCalledTimes(2);
  });
});