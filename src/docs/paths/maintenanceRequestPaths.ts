import type { OpenAPIV3 } from 'openapi-types';

import { dataResponse, errorResponses, jsonBody } from '../helpers.js';
import { requestListParameters } from '../requestParameters.js';

const tags = ['Maintenance requests'];
const readAccess = 'Доступно viewer, technician и admin';
const writeAccess = 'Доступно technician и admin';
const writeErrors = errorResponses(
  'BadRequest', 'Forbidden', 'NotFound',
  'PayloadTooLarge', 'ValidationError',
);

export const maintenanceRequestPaths: OpenAPIV3.PathsObject = {
  '/api/requests': {
    get: {
      tags,
      operationId: 'listMaintenanceRequests',
      summary: 'Получить список заявок',
      description: readAccess,
      parameters: requestListParameters,
      responses: {
        '200': dataResponse(
          'Список заявок с пагинацией',
          'MaintenanceRequest',
          true,
          true,
        ),
        ...errorResponses('BadRequest', 'ValidationError'),
      },
    },
    post: {
      tags,
      operationId: 'createMaintenanceRequest',
      summary: 'Создать заявку',
      description: `${writeAccess} Начальный статус - new`,
      requestBody: jsonBody('CreateMaintenanceRequestInput'),
      responses: {
        '201': {
          ...dataResponse('Заявка создана', 'MaintenanceRequest'),
          headers: {
            Location: {
              description: 'Адрес созданной заявки',
              schema: { type: 'string' },
            },
          },
        },
        ...writeErrors,
      },
    },
  },
  '/api/requests/{id}': {
    parameters: [{ $ref: '#/components/parameters/ResourceId' }],
    get: {
      tags,
      operationId: 'getMaintenanceRequest',
      summary: 'Получить заявку с исполнителями',
      description: readAccess,
      responses: {
        '200': dataResponse('Заявка с исполнителями', 'MaintenanceRequest'),
        ...errorResponses('NotFound', 'ValidationError'),
      },
    },
    patch: {
      tags,
      operationId: 'updateMaintenanceRequest',
      summary: 'Изменить поля заявки',
      description: `${writeAccess} Статус изменяется отдельным запросом.`,
      requestBody: jsonBody('UpdateMaintenanceRequestInput'),
      responses: {
        '200': dataResponse('Заявка обновлена', 'MaintenanceRequest'),
        ...writeErrors,
      },
    },
    delete: {
      tags,
      operationId: 'deleteMaintenanceRequest',
      summary: 'Удалить заявку',
      description: 'Доступно только admin. Выполняется soft delete',
      responses: {
        '204': { description: 'Заявка удалена. Тело ответа отсутствует' },
        ...errorResponses('Forbidden', 'NotFound', 'ValidationError'),
      },
    },
  },
};