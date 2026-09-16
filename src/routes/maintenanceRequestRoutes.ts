import { Router } from 'express';

import {
  type MaintenanceRequestController,
  type MaintenanceRequestParams,
} from '../controllers/maintenanceRequestController.js';

import { validateBody } from '../middlewares/validateBody.js';
import {
  createMaintenanceRequestSchema,
  updateMaintenanceRequestSchema,
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
    '/:id',
    validateBody<MaintenanceRequestParams>(
      updateMaintenanceRequestSchema,
    ),
    requestController.update,
  );

  router.delete<MaintenanceRequestParams>(
    '/:id',
    requestController.delete,
  );

  return router;
};