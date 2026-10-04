import type { OpenAPIV3 } from 'openapi-types';

import { authPaths } from './paths/authPaths.js';
import { authSchemas } from './schemas/authSchemas.js';
import { errorSchemas } from './schemas/errorSchemas.js';
import { securitySchemes } from './securitySchemes.js';
import { commonParameters } from './parameters.js';
import { commonResponses } from './responses.js';
import { paginationSchemas } from './schemas/paginationSchemas.js';
import { equipmentSchemas } from './schemas/equipmentSchemas.js';
import { weatherSchemas } from './schemas/weatherSchemas.js';
import { equipmentPaths } from './paths/equipmentPaths.js';
import { maintenanceRequestSchemas } from './schemas/maintenanceRequestSchemas.js';
import { requestAssigneeSchemas } from './schemas/requestAssigneeSchemas.js';
import { requestStatusHistorySchemas } from './schemas/requestStatusHistorySchemas.js';

export const openapiDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Equipment Maintenance API',
    version: '1.0.0',
    description:
      'Документация аутентификации и оборудования. ' +
      'Чтение доступно всем авторизованным пользователям; ' +
      'изменение оборудования - только admin.',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
  ],
  security: [{ bearerAuth: [] }],
  tags: [
    {
      name: 'Authentication',
      description: 'User registration, authentication and session management',
    },
    {
      name: 'Equipment',
      description: 'Оборудование, паспорта и прогноз погоды',
    },
  ],
  paths: {
    ...authPaths,
    ...equipmentPaths,
  },
  components: {
    schemas: {
      ...authSchemas,
      ...errorSchemas,
      ...paginationSchemas,
      ...equipmentSchemas,
      ...weatherSchemas,
      ...maintenanceRequestSchemas,
      ...requestAssigneeSchemas,
      ...requestStatusHistorySchemas,
    },
    parameters: commonParameters,
    responses: commonResponses,
    securitySchemes,
  },
};