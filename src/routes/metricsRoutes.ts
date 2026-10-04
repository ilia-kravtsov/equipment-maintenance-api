import { Router } from 'express';

import { metricsRegistry } from '../monitoring/metrics.js';

export const createMetricsRouter = (): Router => {
  const router = Router();

  router.get('/', async (_req, res) => {
    const metrics = await metricsRegistry.metrics();

    res.setHeader('Content-Type', metricsRegistry.contentType);
    res.setHeader('Cache-Control', 'no-store');
    res.send(metrics);
  });

  return router;
};