import request from 'supertest';

import { app } from '../../src/app.js';
import { sequelize } from '../../src/database/sequelize.js';

describe('Metrics endpoint', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns metrics without authentication or database access', async () => {
    const authenticate = jest
      .spyOn(sequelize, 'authenticate')
      .mockRejectedValue(new Error('Database unavailable'));

    const response = await request(app)
      .get('/metrics')
      .expect(200);

    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(authenticate).not.toHaveBeenCalled();
  });
});