import express, { Router, type ErrorRequestHandler } from 'express';
import request from 'supertest';

import {
  httpMetrics,
  metricsRoutePrefix,
} from '../../src/middlewares/http/httpMetrics.js';
import { metricsRegistry } from '../../src/monitoring/metrics.js';
import { httpRequestsTotal } from '../../src/monitoring/httpMetrics.js';

const app = express();
const router = Router();

app.use('/api', httpMetrics);
app.use('/api/items', metricsRoutePrefix);

router.get('/:id', (req, res) => {
  if (req.params.id === 'broken') {
    throw new Error('Test failure');
  }

  res.sendStatus(200);
});

app.use('/api/items', router);

const handleError: ErrorRequestHandler = (_error, _req, res, _next) => {
  res.sendStatus(500);
};

app.use(handleError);

describe('HTTP metrics middleware', () => {
  beforeEach(() => {
    metricsRegistry.resetMetrics();
  });

  it('groups IDs and query parameters under one route template', async () => {
    await request(app).get('/api/items/first?search=private').expect(200);
    await request(app).get('/api/items/second').expect(200);

    const { values } = await httpRequestsTotal.get();

    expect(values).toEqual([
      expect.objectContaining({
        labels: expect.objectContaining({
          method: 'GET',
          route: '/api/items/:id',
          status_code: '200',
        }),
        value: 2,
      }),
    ]);
  });

  it('preserves the route prefix for errors', async () => {
    await request(app).get('/api/items/broken').expect(500);

    const { values } = await httpRequestsTotal.get();

    expect(values[0]).toMatchObject({
      labels: {
        route: '/api/items/:id',
        status_code: '500',
      },
      value: 1,
    });
  });

  it('groups unknown URLs without exposing their paths', async () => {
    await request(app).get('/api/unknown-one').expect(404);
    await request(app).get('/api/unknown-two').expect(404);

    const { values } = await httpRequestsTotal.get();

    expect(values[0]).toMatchObject({
      labels: {
        route: '/api/unmatched',
        status_code: '404',
      },
      value: 2,
    });
  });
});