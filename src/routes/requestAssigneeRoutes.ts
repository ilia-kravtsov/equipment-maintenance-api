import { Router, type RequestHandler } from 'express';

import type {
  RequestAssigneeController,
  RequestAssigneeParams,
  RemoveRequestAssigneeParams,
} from '../controllers/requestAssigneeController.js';
import { requireRoles } from '../middlewares/auth/requireRoles.js';
import { validateBody } from '../middlewares/validation/validateBody.js';
import { validateParams } from '../middlewares/validation/validateParams.js';
import { idParamsSchema } from '../validators/commonValidator.js';
import {
  assignRequestAssigneesSchema,
  removeRequestAssigneeParamsSchema,
} from '../validators/requestAssigneeValidator.js';

export const createRequestAssigneeRouter = (
  requestAssigneeController: RequestAssigneeController,
  requireAuth: RequestHandler,
): Router => {
  const router = Router();

  router.post<RequestAssigneeParams>(
    '/:id/assignees',
    requireAuth,
    requireRoles('admin'),
    validateParams<RequestAssigneeParams>(idParamsSchema),
    validateBody<RequestAssigneeParams>(assignRequestAssigneesSchema),
    requestAssigneeController.replace,
  );

  router.delete<RemoveRequestAssigneeParams>(
    '/:id/assignees/:userId',
    requireAuth,
    requireRoles('admin'),
    validateParams<RemoveRequestAssigneeParams>(
      removeRequestAssigneeParamsSchema,
    ),
    requestAssigneeController.remove,
  );

  return router;
};