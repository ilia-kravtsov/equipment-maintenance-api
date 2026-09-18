import { Router } from 'express';
import { validateParams } from '../middlewares/validateParams.js';
import { idParamsSchema } from '../validators/commonValidator.js';
import {
  type EquipmentController,
  type EquipmentParams,
} from '../controllers/equipmentController.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  equipmentListQuerySchema,
} from '../validators/equipmentValidator.js';

import { validateQuery } from '../middlewares/validateQuery.js';

export const createEquipmentRouter = (
  equipmentController: EquipmentController,
): Router => {
  const router = Router();

  router.get(
    '/',
    validateQuery(equipmentListQuerySchema),
    equipmentController.getAll,
  );

  router.post(
    '/',
    validateBody(createEquipmentSchema),
    equipmentController.create,
  );

  router.get<EquipmentParams>(
    '/:id/requests',
    validateParams<EquipmentParams>(idParamsSchema),
    equipmentController.getRequests,
  );

  router.get<EquipmentParams>(
    '/:id/weather',
    validateParams<EquipmentParams>(idParamsSchema),
    equipmentController.getWeather,
  );

  router.get<EquipmentParams>(
    '/:id',
    validateParams<EquipmentParams>(idParamsSchema),
    equipmentController.getById,
  );

  router.patch<EquipmentParams>(
    '/:id',
    validateParams<EquipmentParams>(idParamsSchema),
    validateBody<EquipmentParams>(updateEquipmentSchema),
    equipmentController.update,
  );

  router.delete<EquipmentParams>(
    '/:id',
    validateParams<EquipmentParams>(idParamsSchema),
    equipmentController.delete,
  );

  return router;
};
