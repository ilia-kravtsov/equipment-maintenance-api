import type { OpenAPIV3 } from 'openapi-types';

import { dataResponse, errorResponses, jsonBody } from '../helpers.js';

export const requestImportPaths: OpenAPIV3.PathsObject = {
  '/api/requests/import': {
    post: {
      tags: ['Maintenance requests'],
      operationId: 'importMaintenanceRequests',
      summary: 'Импортировать заявки',
      description:
        'Доступно technician и admin. От 1 до 100 элементов. ' +
        'Каждый элемент проверяется и создаётся отдельно. ' +
        'Ошибка элемента не отменяет успешно созданные заявки. ' +
        'index — позиция элемента, начиная с нуля. ' +
        '207 возвращается при наличии ошибок, даже если не создано ни одной заявки',
      requestBody: jsonBody('ImportMaintenanceRequestsInput'),
      responses: {
        '201': dataResponse('Все заявки созданы', 'RequestImportResult'),
        '207': dataResponse(
          'Обработка завершена с ошибками отдельных элементов',
          'RequestImportResult',
        ),
        ...errorResponses(
          'BadRequest', 'Forbidden', 'PayloadTooLarge', 'ValidationError',
        ),
      },
    },
  },
};