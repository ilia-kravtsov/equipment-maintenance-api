import type { OpenAPIV3 } from 'openapi-types';

export const metricsPaths: OpenAPIV3.PathsObject = {
  '/metrics': {
    get: {
      tags: ['Monitoring'],
      operationId: 'getMetrics',
      summary: 'Получить метрики Prometheus',
      description:
        'Доступен Prometheus внутри сети Compose без Bearer токена. ' +
        'Внешний доступ через Nginx закрыт: возвращается 404. ' +
        'Try it out через публичный адрес не предоставляет метрики',
      security: [],
      responses: {
        '200': {
          description: 'Метрики во внутренней сети',
          content: {
            'text/plain': {
              schema: { type: 'string' },
              example:
                '# HELP http_requests_total Total HTTP requests\n' +
                '# TYPE http_requests_total counter\n',
            },
          },
        },
        '404': {
          description: 'Внешний доступ запрещён конфигурацией Nginx',
          content: {
            'text/html': { schema: { type: 'string' } },
          },
        },
      },
    },
  },
};