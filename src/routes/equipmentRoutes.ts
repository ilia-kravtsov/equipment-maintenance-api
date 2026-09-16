import { Router } from 'express';

import {
  type EquipmentController,
  type EquipmentParams,
} from '../controllers/equipmentController.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
} from '../validators/equipmentValidator.js';

export const createEquipmentRouter = (
  equipmentController: EquipmentController,
): Router => {
  const router = Router();

  router.get('/', equipmentController.getAll);

  router.post(
    '/',
    validateBody(createEquipmentSchema),
    equipmentController.create,
  );

  router.get<EquipmentParams>(
    '/:id',
    equipmentController.getById,
  );

  router.patch<EquipmentParams>(
    '/:id',
    validateBody<EquipmentParams>(updateEquipmentSchema),
    equipmentController.update,
  );

  router.delete<EquipmentParams>(
    '/:id',
    equipmentController.delete,
  );

  return router;
};