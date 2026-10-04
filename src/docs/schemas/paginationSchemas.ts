import type { OpenAPIV3 } from 'openapi-types';

export const paginationSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  PaginationMeta: {
    type: 'object',
    required: ['total', 'page', 'limit'],
    properties: {
      total: {
        type: 'integer',
        minimum: 0,
        description: 'Общее количество записей с учётом фильтров.',
      },
      page: {
        type: 'integer',
        minimum: 1,
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
      },
    },
  },
};