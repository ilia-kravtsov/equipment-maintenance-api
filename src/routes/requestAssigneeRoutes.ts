import { Router } from 'express';

import type {
  RequestAssigneeController,
  RequestAssigneeParams,
  RemoveRequestAssigneeParams,
} from '../controllers/requestAssigneeController.js';
import { requireApiKey } from '../middlewares/auth/requireApiKey.js';
import { validateBody } from '../middlewares/validation/validateBody.js';
import { validateParams } from '../middlewares/validation/validateParams.js';
import { idParamsSchema } from '../validators/commonValidator.js';
import {
  assignRequestAssigneesSchema,
  removeRequestAssigneeParamsSchema,
} from '../validators/requestAssigneeValidator.js';

export const createRequestAssigneeRouter = (
  requestAssigneeController: RequestAssigneeController,
): Router => {
  const router = Router();

  router.post<RequestAssigneeParams>(
    '/:id/assignees',
    requireApiKey,
    validateParams<RequestAssigneeParams>(idParamsSchema),
    validateBody<RequestAssigneeParams>(assignRequestAssigneesSchema),
    requestAssigneeController.replace,
  );

  router.delete<RemoveRequestAssigneeParams>(
    '/:id/assignees/:userId',
    requireApiKey,
    validateParams<RemoveRequestAssigneeParams>(
      removeRequestAssigneeParamsSchema,
    ),
    requestAssigneeController.remove,
  );

  return router;
};