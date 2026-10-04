import { Router, type RequestHandler } from 'express';
import { validateParams } from '../middlewares/validation/validateParams.js';
import { idParamsSchema } from '../validators/commonValidator.js';
import {
  type EquipmentController,
  type EquipmentParams,
} from '../controllers/equipmentController.js';
import { validateBody } from '../middlewares/validation/validateBody.js';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  equipmentListQuerySchema,
} from '../validators/equipmentValidator.js';
import { requireRoles } from '../middlewares/auth/requireRoles.js';

import { validateQuery } from '../middlewares/validation/validateQuery.js';
import { validatePagination } from '../middlewares/validation/validatePagination.js';
import { maintenanceRequestListQuerySchema } from '../validators/maintenanceRequestValidator.js';

export const createEquipmentRouter = (
  equipmentController: EquipmentController,
  requireAuth: RequestHandler,
): Router => {
  const router = Router();

  router.use(requireAuth);

  router.get(
    '/',
    validatePagination,
    validateQuery(equipmentListQuerySchema),
    equipmentController.getAll,
  );

  router.post(
    '/',
    requireRoles('admin'),
    validateBody(createEquipmentSchema),
    equipmentController.create,
  );

  router.get<EquipmentParams>(
    '/:id/requests',
    validateParams<EquipmentParams>(idParamsSchema),
    validatePagination,
    validateQuery(maintenanceRequestListQuerySchema),
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
    requireRoles('admin'),
    validateParams<EquipmentParams>(idParamsSchema),
    validateBody<EquipmentParams>(updateEquipmentSchema),
    equipmentController.update,
  );

  router.delete<EquipmentParams>(
    '/:id',
    requireRoles('admin'),
    validateParams<EquipmentParams>(idParamsSchema),
    equipmentController.delete,
  );

  return router;
};
