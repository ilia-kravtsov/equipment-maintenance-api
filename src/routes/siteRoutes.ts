import { Router, type RequestHandler } from 'express';

import type {
  SiteController,
  SiteParams,
} from '../controllers/siteController.js';
import type {
  SiteSummaryController,
  SiteSummaryParams,
} from '../controllers/siteSummaryController.js';
import { requireRoles } from '../middlewares/auth/requireRoles.js';
import { validateBody } from '../middlewares/validation/validateBody.js';
import { validateParams } from '../middlewares/validation/validateParams.js';
import { idParamsSchema } from '../validators/commonValidator.js';
import {
  createSiteSchema,
  updateSiteSchema,
} from '../validators/siteValidator.js';

export const createSiteRouter = (
  siteController: SiteController,
  siteSummaryController: SiteSummaryController,
  requireAuth: RequestHandler,
): Router => {
  const router = Router();

  router.use(requireAuth);

  router.get('/', siteController.getAll);

  router.post(
    '/',
    requireRoles('admin'),
    validateBody(createSiteSchema),
    siteController.create,
  );

  router.get<SiteSummaryParams>(
    '/:id/summary',
    validateParams<SiteSummaryParams>(idParamsSchema),
    siteSummaryController.getSummary,
  );

  router.get<SiteParams>(
    '/:id',
    validateParams<SiteParams>(idParamsSchema),
    siteController.getById,
  );

  router.patch<SiteParams>(
    '/:id',
    requireRoles('admin'),
    validateParams<SiteParams>(idParamsSchema),
    validateBody<SiteParams>(updateSiteSchema),
    siteController.update,
  );

  router.delete<SiteParams>(
    '/:id',
    requireRoles('admin'),
    validateParams<SiteParams>(idParamsSchema),
    siteController.delete,
  );

  return router;
};