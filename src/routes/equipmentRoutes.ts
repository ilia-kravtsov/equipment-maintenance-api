import { Router } from 'express';

import { EquipmentController } from '../controllers/equipmentController.js';
import { InMemoryEquipmentRepository } from '../repositories/inMemoryEquipmentRepository.js';
import { EquipmentService } from '../services/equipmentService.js';

const equipmentRepository = new InMemoryEquipmentRepository();
const equipmentService = new EquipmentService(equipmentRepository);
const equipmentController = new EquipmentController(equipmentService);

export const equipmentRouter = Router();

equipmentRouter.get('/', equipmentController.getAll);
equipmentRouter.post('/', equipmentController.create);

equipmentRouter.get('/:id', equipmentController.getById);
equipmentRouter.patch('/:id', equipmentController.update);
equipmentRouter.delete('/:id', equipmentController.delete);