import type { OpenAPIV3 } from 'openapi-types';

import { dataResponse, errorResponses, jsonBody } from '../helpers.js';
import { errorResponse } from '../responses.js';

function referencePathsFor(
  resource: string,
  schema: string,
  tag: string,
  uniqueMessage: string,
): OpenAPIV3.PathsObject {
  const tags = [tag];
  const writeErrors = {
    ...errorResponses(
      'BadRequest', 'Forbidden', 'PayloadTooLarge', 'ValidationError',
    ),
    '409': errorResponse('CONFLICT', uniqueMessage),
  };

  return {
    [`/api/${resource}`]: {
      get: {
        tags,
        operationId: `list${schema}`,
        summary: 'Получить список',
        description: 'Доступно viewer, technician и admin. Без пагинации',
        responses: {
          '200': dataResponse('Список записей', schema, true),
          ...errorResponses(),
        },
      },
      post: {
        tags,
        operationId: `create${schema}`,
        summary: 'Создать запись',
        description: 'Доступно только admin.',
        requestBody: jsonBody(`Create${schema}Input`),
        responses: {
          '201': {
            ...dataResponse('Запись создана', schema),
            headers: {
              Location: {
                description: 'Адрес созданной записи',
                schema: { type: 'string' },
              },
            },
          },
          ...writeErrors,
        },
      },
    },
    [`/api/${resource}/{id}`]: {
      parameters: [{ $ref: '#/components/parameters/ResourceId' }],
      get: {
        tags,
        operationId: `get${schema}`,
        summary: 'Получить запись по ID',
        description: 'Доступно viewer, technician и admin',
        responses: {
          '200': dataResponse('Запись справочника', schema),
          ...errorResponses('NotFound', 'ValidationError'),
        },
      },
      patch: {
        tags,
        operationId: `update${schema}`,
        summary: 'Изменить запись',
        description: 'Доступно только admin. Требуется хотя бы одно поле',
        requestBody: jsonBody(`Update${schema}Input`),
        responses: {
          '200': dataResponse('Запись обновлена', schema),
          ...writeErrors,
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags,
        operationId: `delete${schema}`,
        summary: 'Удалить запись',
        description:
          'Доступно только admin. Связанная запись не удаляется',
        responses: {
          '204': { description: 'Запись удалена. Тело ответа отсутствует.' },
          ...errorResponses('Forbidden', 'NotFound', 'ValidationError'),
          '409': errorResponse(
            'CONFLICT',
            'Record is referenced by other records',
            'Запись используется связанными данными',
          ),
        },
      },
    },
  };
}

export const referencePaths: OpenAPIV3.PathsObject = {
  ...referencePathsFor(
    'sites', 'Site', 'Sites', 'Site with this code already exists',
  ),
  ...referencePathsFor(
    'technicians', 'Technician', 'Technicians',
    'Technician with this employee number already exists',
  ),
};