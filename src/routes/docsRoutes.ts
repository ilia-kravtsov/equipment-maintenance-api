import { Router } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { openapiDocument } from '../docs/openapi.js';

export function createDocsRouter(): Router {
  const router = Router();

  router.get('/openapi.json', (_req, res) => {
    res.json(openapiDocument);
  });

  router.use(
    ['/api/docs', '/api-docs'],
    helmet.contentSecurityPolicy({
      directives: {
        upgradeInsecureRequests:
          process.env.NODE_ENV === 'production' ? [] : null,
      },
    }),
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument, {
      customSiteTitle: 'Equipment Maintenance API',
      swaggerOptions: {
        validatorUrl: null,
        persistAuthorization: false,
      },
    }),
  );

  return router;
}