import { Router } from 'express';

import type {
  SiteSummaryController,
  SiteSummaryParams,
} from '../controllers/siteSummaryController.js';
import { validateParams } from '../middlewares/validation/validateParams.js';
import { idParamsSchema } from '../validators/commonValidator.js';

export const createSiteRouter = (
  siteSummaryController: SiteSummaryController,
): Router => {
  const router = Router();

  router.get<SiteSummaryParams>(
    '/:id/summary',
    validateParams<SiteSummaryParams>(idParamsSchema),
    siteSummaryController.getSummary,
  );

  return router;
};