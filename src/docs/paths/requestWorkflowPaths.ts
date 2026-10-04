import type { OpenAPIV3 } from 'openapi-types';

import { dataResponse, errorResponses, jsonBody } from '../helpers.js';
import { errorResponse } from '../responses.js';

const tags = ['Maintenance requests'];
const parameters = [{ $ref: '#/components/parameters/ResourceId' }];

export const requestWorkflowPaths: OpenAPIV3.PathsObject = {
  '/api/requests/{id}/status': {
    parameters,
    patch: {
      tags,
      operationId: 'updateMaintenanceRequestStatus',
      summary: 'Изменить статус заявки',
      description:
        'Доступно admin и назначенному на заявку technician. ' +
        'Переходы: new - in_progress или rejected in_progress - done или rejected. ' +
        'Для начала работ требуется бригада. ' +
        'Смена статуса и запись автора в историю выполняются в одной транзакции',
      requestBody: jsonBody('UpdateMaintenanceRequestStatusInput'),
      responses: {
        '200': dataResponse('Статус обновлён', 'MaintenanceRequest'),
        ...errorResponses(
          'BadRequest', 'Forbidden', 'NotFound',
          'PayloadTooLarge', 'ValidationError',
        ),
        '409': errorResponse(
          'CONFLICT',
          'Cannot start a maintenance request without assigned technicians',
          'Недопустимый переход статуса или отсутствует бригада',
        ),
      },
    },
  },
  '/api/requests/{id}/history': {
    parameters,
    get: {
      tags,
      operationId: 'getMaintenanceRequestHistory',
      summary: 'Получить историю статусов',
      description: 'Доступно viewer, technician и admin',
      responses: {
        '200': dataResponse(
          'История статусов заявки',
          'RequestStatusHistory',
          true,
        ),
        ...errorResponses('NotFound', 'ValidationError'),
      },
    },
  },
};