import { Router } from 'express';

import {
  type MaintenanceRequestController,
  type MaintenanceRequestParams,
} from '../controllers/maintenanceRequestController.js';
import { validateQuery } from '../middlewares/validateQuery.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createMaintenanceRequestSchema,
  updateMaintenanceRequestSchema, updateMaintenanceRequestStatusSchema,
  maintenanceRequestListQuerySchema,
} from '../validators/maintenanceRequestValidator.js';

export const createMaintenanceRequestRouter = (
  requestController: MaintenanceRequestController,
): Router => {
  const router = Router();

  router.get(
    '/',
    validateQuery(maintenanceRequestListQuerySchema),
    requestController.getAll,
  );

  router.post(
    '/',
    validateBody(createMaintenanceRequestSchema),
    requestController.create,
  );

  router.get<MaintenanceRequestParams>(
    '/:id',
    requestController.getById,
  );

  router.patch<MaintenanceRequestParams>(
    '/:id',
    validateBody<MaintenanceRequestParams>(
      updateMaintenanceRequestSchema,
    ),
    requestController.update,
  );

  router.patch<MaintenanceRequestParams>(
    '/:id/status',
    validateBody<MaintenanceRequestParams>(
      updateMaintenanceRequestStatusSchema,
    ),
    requestController.updateStatus,
  );

  router.delete<MaintenanceRequestParams>(
    '/:id',
    requestController.delete,
  );

  return router;
};