import type { OpenAPIV3 } from 'openapi-types';

import { dataResponse, errorResponses } from '../helpers.js';
import { requestListParameters } from '../requestParameters.js';

export const equipmentRequestPaths: OpenAPIV3.PathsObject = {
  '/api/equipment/{id}/requests': {
    parameters: [{ $ref: '#/components/parameters/ResourceId' }],
    get: {
      tags: ['Equipment'],
      operationId: 'listEquipmentRequests',
      summary: 'Получить заявки оборудования',
      description:
        'Доступно viewer, technician и admin. ' +
        'Поддерживает фильтры, сортировку и пагинацию. ' +
        'Ответ содержит data без meta. ' +
        'Оборудование определяется параметром пути id',
      parameters: requestListParameters.filter(
        (parameter) => !('name' in parameter) ||
          parameter.name !== 'equipmentId',
      ),
      responses: {
        '200': dataResponse(
          'Заявки оборудования',
          'MaintenanceRequest',
          true,
        ),
        ...errorResponses('BadRequest', 'NotFound', 'ValidationError'),
      },
    },
  },
};