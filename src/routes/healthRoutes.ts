import { Router } from 'express';

interface HealthDatabase {
  authenticate(): Promise<void>;
}

export const createHealthRouter = (
  database: HealthDatabase,
): Router => {
  const router = Router();

  router.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  router.get(['/', '/live'], (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.get('/ready', async (_req, res) => {
    try {
      await database.authenticate();

      res.status(200).json({
        status: 'ready',
      });
    } catch {
      res.status(503).json({
        status: 'not_ready',
      });
    }
  });

  return router;
};