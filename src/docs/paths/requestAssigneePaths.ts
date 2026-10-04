import type { OpenAPIV3 } from 'openapi-types';

import { errorResponses, jsonBody } from '../helpers.js';
import { errorResponse } from '../responses.js';

const tags = ['Maintenance requests'];
const requestId = { $ref: '#/components/parameters/ResourceId' };

export const requestAssigneePaths: OpenAPIV3.PathsObject = {
  '/api/requests/{id}/assignees': {
    parameters: [requestId],
    post: {
      tags,
      operationId: 'replaceRequestAssignees',
      summary: 'Назначить бригаду заявки',
      description:
        'Доступно только admin. Полностью заменяет текущую бригаду. ' +
        'Требуется ровно один lead, остальные исполнители - member. ' +
        'Повторение technicianId запрещено. ' +
        'При ошибке прежняя бригада сохраняется',
      requestBody: jsonBody('AssignRequestAssigneesInput'),
      responses: {
        '204': { description: 'Бригада назначена. Тело ответа отсутствует' },
        ...errorResponses(
          'BadRequest', 'Forbidden', 'NotFound',
          'PayloadTooLarge', 'ValidationError',
        ),
        '409': errorResponse(
          'CONFLICT',
          'A technician cannot be assigned to the same request twice',
          'Специалист указан в бригаде повторно',
        ),
      },
    },
  },
  '/api/requests/{id}/assignees/{userId}': {
    parameters: [
      requestId,
      {
        name: 'userId',
        in: 'path',
        required: true,
        description: 'ID специалиста из справочника technicians, не аккаунта users',
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    delete: {
      tags,
      operationId: 'removeRequestAssignee',
      summary: 'Снять исполнителя с заявки',
      description:
        'Доступно только admin. Нельзя снять последнего исполнителя ' +
        'с заявки in_progress или ведущего, пока в бригаде есть другие участники',
      responses: {
        '204': { description: 'Исполнитель снят. Тело ответа отсутствует' },
        ...errorResponses('Forbidden', 'NotFound', 'ValidationError'),
        '409': errorResponse(
          'CONFLICT',
          'Cannot remove the last technician from a request in progress',
          'Удаление нарушает ограничения состава бригады',
        ),
      },
    },
  },
};