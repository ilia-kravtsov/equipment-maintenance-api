import { Router } from 'express';
import { validateParams } from '../middlewares/validateParams.js';
import { idParamsSchema } from '../validators/commonValidator.js';
import {
  type MaintenanceRequestController,
  type MaintenanceRequestParams,
} from '../controllers/maintenanceRequestController.js';
import { validateQuery } from '../middlewares/validateQuery.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createMaintenanceRequestSchema,
  updateMaintenanceRequestSchema,
  updateMaintenanceRequestStatusSchema,
  maintenanceRequestListQuerySchema,
  importMaintenanceRequestsSchema,
} from '../validators/maintenanceRequestValidator.js';
import { requireApiKey } from '../middlewares/requireApiKey.js';

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
    requireApiKey,
    validateBody(createMaintenanceRequestSchema),
    requestController.create,
  );

  router.post(
    '/import',
    requireApiKey,
    validateBody(importMaintenanceRequestsSchema),
    requestController.importMany,
  );

  router.get<MaintenanceRequestParams>(
    '/:id',
    validateParams<MaintenanceRequestParams>(idParamsSchema),
    requestController.getById,
  );

  router.patch<MaintenanceRequestParams>(
    '/:id',
    requireApiKey,
    validateParams<MaintenanceRequestParams>(idParamsSchema),
    validateBody<MaintenanceRequestParams>(updateMaintenanceRequestSchema),
    requestController.update,
  );

  router.patch<MaintenanceRequestParams>(
    '/:id/status',
    requireApiKey,
    validateParams<MaintenanceRequestParams>(idParamsSchema),
    validateBody<MaintenanceRequestParams>(
      updateMaintenanceRequestStatusSchema,
    ),
    requestController.updateStatus,
  );

  router.delete<MaintenanceRequestParams>(
    '/:id',
    requireApiKey,
    validateParams<MaintenanceRequestParams>(idParamsSchema),
    requestController.delete,
  );

  return router;
};
