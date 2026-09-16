import { Router } from 'express';

import {
  type MaintenanceRequestController,
  type MaintenanceRequestParams,
} from '../controllers/maintenanceRequestController.js';

export const createMaintenanceRequestRouter = (
  requestController: MaintenanceRequestController,
): Router => {
  const router = Router();

  router.get('/', requestController.getAll);
  router.post('/', requestController.create);

  router.get<MaintenanceRequestParams>(
    '/:id',
    requestController.getById,
  );

  router.patch<MaintenanceRequestParams>(
    '/:id',
    requestController.update,
  );

  router.delete<MaintenanceRequestParams>(
    '/:id',
    requestController.delete,
  );

  return router;
};