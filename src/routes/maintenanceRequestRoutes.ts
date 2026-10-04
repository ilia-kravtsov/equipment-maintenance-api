import { Router, type RequestHandler } from 'express';
import { validateParams } from '../middlewares/validation/validateParams.js';
import { idParamsSchema } from '../validators/commonValidator.js';
import {
  type MaintenanceRequestController,
  type MaintenanceRequestParams,
} from '../controllers/maintenanceRequestController.js';
import { validateQuery } from '../middlewares/validation/validateQuery.js';
import { validateBody } from '../middlewares/validation/validateBody.js';
import {
  createMaintenanceRequestSchema,
  updateMaintenanceRequestSchema,
  updateMaintenanceRequestStatusSchema,
  maintenanceRequestListQuerySchema,
  importMaintenanceRequestsSchema,
} from '../validators/maintenanceRequestValidator.js';
import { requireRoles } from '../middlewares/auth/requireRoles.js';
import { validatePagination } from '../middlewares/validation/validatePagination.js';

export const createMaintenanceRequestRouter = (
  requestController: MaintenanceRequestController,
  requireAuth: RequestHandler,
): Router => {
  const router = Router();

  router.use(requireAuth);

  router.get(
    '/',
    validatePagination,
    validateQuery(maintenanceRequestListQuerySchema),
    requestController.getAll,
  );

  router.post(
    '/',
    requireRoles('technician', 'admin'),
    validateBody(createMaintenanceRequestSchema),
    requestController.create,
  );

  router.post(
    '/import',
    requireRoles('technician', 'admin'),
    validateBody(importMaintenanceRequestsSchema),
    requestController.importMany,
  );

  router.get<MaintenanceRequestParams>(
    '/:id',
    validateParams<MaintenanceRequestParams>(idParamsSchema),
    requestController.getById,
  );

  router.get<MaintenanceRequestParams>(
    '/:id/history',
    validateParams<MaintenanceRequestParams>(idParamsSchema),
    requestController.getHistory,
  );

  router.patch<MaintenanceRequestParams>(
    '/:id',
    requireRoles('technician', 'admin'),
    validateParams<MaintenanceRequestParams>(idParamsSchema),
    validateBody<MaintenanceRequestParams>(updateMaintenanceRequestSchema),
    requestController.update,
  );

  router.patch<MaintenanceRequestParams>(
    '/:id/status',
    requireRoles('technician', 'admin'),
    validateParams<MaintenanceRequestParams>(idParamsSchema),
    validateBody<MaintenanceRequestParams>(
      updateMaintenanceRequestStatusSchema,
    ),
    requestController.updateStatus,
  );

  router.delete<MaintenanceRequestParams>(
    '/:id',
    requireRoles('admin'),
    validateParams<MaintenanceRequestParams>(idParamsSchema),
    requestController.delete,
  );

  return router;
};
