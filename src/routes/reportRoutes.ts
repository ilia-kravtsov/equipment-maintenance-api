import { Router } from 'express';

import type { EquipmentLoadController } from '../controllers/equipmentLoadController.js';
import { validateQuery } from '../middlewares/validateQuery.js';
import { equipmentLoadQuerySchema } from '../validators/equipmentLoadValidator.js';

export const createReportRouter = (
  equipmentLoadController: EquipmentLoadController,
): Router => {
  const router = Router();

  router.get(
    '/equipment-load',
    validateQuery(equipmentLoadQuerySchema, 400),
    equipmentLoadController.getAll,
  );

  return router;
};