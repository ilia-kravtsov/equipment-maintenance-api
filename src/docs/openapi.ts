import type { OpenAPIV3 } from 'openapi-types';

import { authPaths } from './paths/authPaths.js';
import { authSchemas } from './schemas/authSchemas.js';
import { errorSchemas } from './schemas/errorSchemas.js';
import { securitySchemes } from './securitySchemes.js';

export const openapiDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Equipment Maintenance API',
    version: '1.0.0',
    description:
      'Authentication API documentation. Other application endpoints are not yet described in this specification.',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User registration, authentication and session management.',
    },
  ],
  paths: {
    ...authPaths,
  },
  components: {
    schemas: {
      ...authSchemas,
      ...errorSchemas,
    },
    securitySchemes,
  },
};