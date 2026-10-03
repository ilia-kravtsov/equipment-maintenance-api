import { Router } from 'express';

interface HealthDatabase {
  authenticate(): Promise<void>;
}

export const createHealthRouter = (
  database: HealthDatabase,
): Router => {
  const router = Router();
  let pendingCheck: Promise<boolean> | undefined;

  const checkDatabase = (): Promise<boolean> => {
    if (!pendingCheck) {
      pendingCheck = database.authenticate()
        .then(() => true, () => false)
        .finally(() => {
          pendingCheck = undefined;
        });
    }

    return pendingCheck;
  };

  router.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  router.get(['/', '/live'], (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.get('/ready', async (_req, res) => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
      const timeout = new Promise<boolean>((resolve) => {
        timer = setTimeout(() => resolve(false), 2000);
      });

      const ready = await Promise.race([
        checkDatabase(),
        timeout,
      ]);

      res.status(ready ? 200 : 503).json({
        status: ready ? 'ready' : 'not_ready',
      });
    } finally {
      clearTimeout(timer);
    }
  });

  return router;
};