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
import { maintenanceRequestPaths } from './paths/maintenanceRequestPaths.js';
import { requestWorkflowPaths } from './paths/requestWorkflowPaths.js';
import { requestAssigneePaths } from './paths/requestAssigneePaths.js';
import { requestImportSchemas } from './schemas/requestImportSchemas.js';
import { requestImportPaths } from './paths/requestImportPaths.js';
import { equipmentRequestPaths } from './paths/equipmentRequestPaths.js';

export const openapiDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Equipment Maintenance API',
    version: '1.0.0',
    description: 'API обслуживания оборудования. Защищённые операции используют Bearer access token',
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
    {
      name: 'Maintenance requests',
      description: 'Заявки на обслуживание',
    },
  ],
  paths: {
    ...authPaths,
    ...equipmentPaths,
    ...maintenanceRequestPaths,
    ...requestWorkflowPaths,
    ...requestAssigneePaths,
    ...requestImportPaths,
    ...equipmentRequestPaths,
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
      ...requestImportSchemas,
    },
    parameters: commonParameters,
    responses: commonResponses,
    securitySchemes,
  },
};