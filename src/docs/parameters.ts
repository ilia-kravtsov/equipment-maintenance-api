import type { OpenAPIV3 } from 'openapi-types';

export const commonParameters: Record<
  string,
  OpenAPIV3.ParameterObject
> = {
  ResourceId: {
    name: 'id',
    in: 'path',
    required: true,
    description: 'UUID ресурса.',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  },

  Page: {
    name: 'page',
    in: 'query',
    description: 'Номер страницы.',
    schema: {
      type: 'integer',
      minimum: 1,
      default: 1,
    },
  },

  PageLimit: {
    name: 'limit',
    in: 'query',
    description: 'Количество записей на странице.',
    schema: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 20,
    },
  },

  SortOrder: {
    name: 'order',
    in: 'query',
    description: 'Направление сортировки.',
    schema: {
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'asc',
    },
  },
};