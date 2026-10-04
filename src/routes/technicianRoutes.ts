import { Router, type RequestHandler } from 'express';

import type {
  TechnicianController,
  TechnicianParams,
} from '../controllers/technicianController.js';
import { requireRoles } from '../middlewares/auth/requireRoles.js';
import { validateBody } from '../middlewares/validation/validateBody.js';
import { validateParams } from '../middlewares/validation/validateParams.js';
import { idParamsSchema } from '../validators/commonValidator.js';
import {
  createTechnicianSchema,
  updateTechnicianSchema,
} from '../validators/technicianValidator.js';

export const createTechnicianRouter = (
  controller: TechnicianController,
  requireAuth: RequestHandler,
): Router => {
  const router = Router();

  router.use(requireAuth);

  router.get('/', controller.getAll);

  router.get<TechnicianParams>(
    '/:id',
    validateParams<TechnicianParams>(idParamsSchema),
    controller.getById,
  );

  router.post(
    '/',
    requireRoles('admin'),
    validateBody(createTechnicianSchema),
    controller.create,
  );

  router.patch<TechnicianParams>(
    '/:id',
    requireRoles('admin'),
    validateParams<TechnicianParams>(idParamsSchema),
    validateBody<TechnicianParams>(updateTechnicianSchema),
    controller.update,
  );

  router.delete<TechnicianParams>(
    '/:id',
    requireRoles('admin'),
    validateParams<TechnicianParams>(idParamsSchema),
    controller.delete,
  );

  return router;
};