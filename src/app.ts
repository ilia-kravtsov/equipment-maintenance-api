import express from 'express';
import { EquipmentController } from './controllers/equipmentController.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { InMemoryEquipmentRepository } from './repositories/inMemoryEquipmentRepository.js';
import { createEquipmentRouter } from './routes/equipmentRoutes.js';
import { EquipmentService } from './services/equipmentService.js';

export const app = express();

const equipmentRepository = new InMemoryEquipmentRepository();
const equipmentService = new EquipmentService(equipmentRepository);
const equipmentController = new EquipmentController(equipmentService);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

app.use(
  '/api/equipment',
  createEquipmentRouter(equipmentController),
);

app.use(errorHandler);