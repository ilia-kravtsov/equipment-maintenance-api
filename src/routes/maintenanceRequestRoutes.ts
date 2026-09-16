import { Router } from 'express';

import {
  type MaintenanceRequestController,
  type MaintenanceRequestParams,
} from '../controllers/maintenanceRequestController.js';

import { validateBody } from '../middlewares/validateBody.js';
import {
  createMaintenanceRequestSchema,
  updateMaintenanceRequestStatusSchema,
} from '../validators/maintenanceRequestValidator.js';

export const createMaintenanceRequestRouter = (
  requestController: MaintenanceRequestController,
): Router => {
  const router = Router();

  router.get('/', requestController.getAll);
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