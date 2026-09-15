import express from 'express';
import { equipmentRouter } from './routes/equipmentRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const app = express();

app.use(express.json());

app.use('/api/equipment', equipmentRouter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

app.use(errorHandler);