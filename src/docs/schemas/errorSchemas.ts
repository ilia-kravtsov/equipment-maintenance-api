import type { OpenAPIV3 } from 'openapi-types';

export const errorSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  ErrorResponse: {
    type: 'object',
    additionalProperties: false,
    required: ['error'],
    properties: {
      error: {
        type: 'object',
        additionalProperties: false,
        required: ['code', 'message', 'requestId'],
        properties: {
          code: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
          requestId: {
            type: 'string',
            description: 'Идентификатор запроса для поиска в логах.',
          },
          details: {
            type: 'array',
            description: 'Подробности ошибок валидации',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['field', 'message'],
              properties: {
                field: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
};