import { Router, type RequestHandler } from 'express';

import type { EquipmentLoadController } from '../controllers/equipmentLoadController.js';
import { validateQuery } from '../middlewares/validation/validateQuery.js';
import { equipmentLoadQuerySchema } from '../validators/equipmentLoadValidator.js';

export const createReportRouter = (
  equipmentLoadController: EquipmentLoadController,
  requireAuth: RequestHandler,
): Router => {
  const router = Router();

  router.use(requireAuth);

  router.get(
    '/equipment-load',
    validateQuery(equipmentLoadQuerySchema, 400),
    equipmentLoadController.getAll,
  );

  return router;
};