import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
} from '../validators/equipmentValidator.js';

import {
  EquipmentController,
  type EquipmentParams,
} from '../controllers/equipmentController.js';
import { InMemoryEquipmentRepository } from '../repositories/inMemoryEquipmentRepository.js';
import { EquipmentService } from '../services/equipmentService.js';

const equipmentRepository = new InMemoryEquipmentRepository();
const equipmentService = new EquipmentService(equipmentRepository);
const equipmentController = new EquipmentController(equipmentService);

export const equipmentRouter = Router();

equipmentRouter.get('/', equipmentController.getAll);
equipmentRouter.post(
  '/',
  validateBody(createEquipmentSchema),
  equipmentController.create,
);

equipmentRouter.get<EquipmentParams>(
  '/:id',
  equipmentController.getById,
);

equipmentRouter.patch<EquipmentParams>(
  '/:id',
  validateBody<EquipmentParams>(updateEquipmentSchema),
  equipmentController.update,
);

equipmentRouter.delete<EquipmentParams>(
  '/:id',
  equipmentController.delete,
);