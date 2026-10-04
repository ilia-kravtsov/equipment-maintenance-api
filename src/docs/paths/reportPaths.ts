import type { OpenAPIV3 } from 'openapi-types';

import { dataResponse, errorResponses } from '../helpers.js';

const query = (
  name: string,
  schema: OpenAPIV3.SchemaObject,
): OpenAPIV3.ParameterObject => ({
  name,
  in: 'query',
  schema,
});

export const reportPaths: OpenAPIV3.PathsObject = {
  '/api/sites/{id}/summary': {
    parameters: [{ $ref: '#/components/parameters/ResourceId' }],
    get: {
      tags: ['Reports'],
      operationId: 'getSiteSummary',
      summary: 'Получить сводку площадки',
      description:
        'Доступно viewer, technician и admin. ' +
        'Удалённое оборудование и удалённые заявки исключаются',
      responses: {
        '200': dataResponse('Сводка площадки', 'SiteSummary'),
        ...errorResponses('NotFound', 'ValidationError'),
      },
    },
  },
  '/api/reports/equipment-load': {
    get: {
      tags: ['Reports'],
      operationId: 'getEquipmentLoad',
      summary: 'Получить загрузку оборудования',
      description:
        'Доступно viewer, technician и admin. ' +
        'from и to ограничивают дату создания заявок включительно, from ≤ to. ' +
        'Удалённые записи исключаются. Сортировка по ID оборудования. ' +
        'Ответ содержит data без meta',
      parameters: [
        query('from', { type: 'string', format: 'date-time' }),
        query('to', { type: 'string', format: 'date-time' }),
        query('minRequests', {
          type: 'integer', minimum: 0, maximum: 2147483647, default: 0,
        }),
        query('limit', {
          type: 'integer', minimum: 1, maximum: 100, default: 20,
        }),
        query('offset', {
          type: 'integer', minimum: 0, maximum: 10000, default: 0,
        }),
      ],
      responses: {
        '200': dataResponse('Загрузка оборудования', 'EquipmentLoad', true),
        ...errorResponses('BadRequest'),
      },
    },
  },
};