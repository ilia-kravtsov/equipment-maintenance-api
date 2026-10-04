import type { OpenAPIV3 } from 'openapi-types';

const statusResponse = (
  status: string,
  description: string,
): OpenAPIV3.ResponseObject => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: [status] },
        },
      },
      example: { status },
    },
  },
});

const liveResponses = {
  '200': statusResponse('ok', 'Процесс приложения работает'),
};

export const healthPaths: OpenAPIV3.PathsObject = {
  '/api/health': {
    get: {
      tags: ['Health'],
      operationId: 'getHealth',
      summary: 'Проверить работу приложения',
      description: 'Совместимый адрес проверки. Не обращается к БД',
      security: [],
      responses: liveResponses,
    },
  },
  '/api/health/live': {
    get: {
      tags: ['Health'],
      operationId: 'getLiveness',
      summary: 'Проверить liveness',
      description: 'Не обращается к БД.',
      security: [],
      responses: liveResponses,
    },
  },
  '/api/health/ready': {
    get: {
      tags: ['Health'],
      operationId: 'getReadiness',
      summary: 'Проверить readiness',
      description:
        'Проверяет соединение с БД. Ожидание результата - до двух секунд.',
      security: [],
      responses: {
        '200': statusResponse('ready', 'Приложение готово'),
        '503': statusResponse('not_ready', 'БД недоступна или проверка не завершилась вовремя'),
      },
    },
  },
};