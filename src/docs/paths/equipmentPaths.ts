import type { OpenAPIV3 } from 'openapi-types';

import {
  equipmentStatuses,
  equipmentTypes,
} from '../../models/equipment/equipment.js';

const jsonResponse = (
  description: string,
  schema: string,
): OpenAPIV3.ResponseObject => ({
  description,
  content: {
    'application/json': {
      schema: {
        $ref: `#/components/schemas/${schema}`,
      },
    },
  },
});

const jsonBody = (schema: string): OpenAPIV3.RequestBodyObject => ({
  required: true,
  content: {
    'application/json': {
      schema: {
        $ref: `#/components/schemas/${schema}`,
      },
    },
  },
});

const commonErrors: OpenAPIV3.ResponsesObject = {
  '401': { $ref: '#/components/responses/Unauthorized' },
  '429': { $ref: '#/components/responses/TooManyRequests' },
  '500': { $ref: '#/components/responses/InternalServerError' },
};

export const equipmentPaths: OpenAPIV3.PathsObject = {
  '/api/equipment': {
    get: {
      tags: ['Equipment'],
      operationId: 'listEquipment',
      summary: 'Получить список оборудования',
      description: 'Доступно viewer, technician и admin',
      parameters: [
        { $ref: '#/components/parameters/Page' },
        { $ref: '#/components/parameters/PageLimit' },
        { $ref: '#/components/parameters/SortOrder' },
        {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: [...equipmentStatuses],
          },
        },
        {
          name: 'type',
          in: 'query',
          schema: {
            type: 'string',
            enum: [...equipmentTypes],
          },
        },
        {
          name: 'sortBy',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['name', 'type', 'status', 'installedAt'],
          },
        },
      ],
      responses: {
        '200': jsonResponse(
          'Список оборудования с пагинацией',
          'EquipmentListResponse',
        ),
        '400': { $ref: '#/components/responses/BadRequest' },
        '422': { $ref: '#/components/responses/ValidationError' },
        ...commonErrors,
      },
    },

    post: {
      tags: ['Equipment'],
      operationId: 'createEquipment',
      summary: 'Создать оборудование',
      description: 'Доступно только admin. Серийный номер должен быть уникальным',
      requestBody: jsonBody('CreateEquipmentInput'),
      responses: {
        '201': {
          ...jsonResponse('Оборудование создано.', 'EquipmentResponse'),
          headers: {
            Location: {
              description: 'Адрес созданного оборудования.',
              schema: {
                type: 'string',
                example: '/api/equipment/00000000-0000-4000-8000-000000000001',
              },
            },
          },
        },
        '403': { $ref: '#/components/responses/Forbidden' },
        '409': { $ref: '#/components/responses/Conflict' },
        '422': { $ref: '#/components/responses/ValidationError' },
        ...commonErrors,
      },
    },
  },

  '/api/equipment/{id}': {
    parameters: [
      { $ref: '#/components/parameters/ResourceId' },
    ],

    get: {
      tags: ['Equipment'],
      operationId: 'getEquipment',
      summary: 'Получить оборудование по ID',
      description:
        'Доступно viewer, technician и admin. ' +
        'Возвращает паспорт оборудования или passport: null.',
      responses: {
        '200': jsonResponse(
          'Оборудование и его паспорт.',
          'EquipmentDetailsResponse',
        ),
        '404': { $ref: '#/components/responses/NotFound' },
        '422': { $ref: '#/components/responses/ValidationError' },
        ...commonErrors,
      },
    },

    patch: {
      tags: ['Equipment'],
      operationId: 'updateEquipment',
      summary: 'Обновить оборудование',
      description: 'Доступно только admin. Обновляются переданные поля.',
      requestBody: jsonBody('UpdateEquipmentInput'),
      responses: {
        '200': jsonResponse('Оборудование обновлено.', 'EquipmentResponse'),
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
        '409': { $ref: '#/components/responses/Conflict' },
        '422': { $ref: '#/components/responses/ValidationError' },
        ...commonErrors,
      },
    },

    delete: {
      tags: ['Equipment'],
      operationId: 'deleteEquipment',
      summary: 'Удалить оборудование',
      description:
        'Доступно только admin. Выполняется soft delete. ' +
        'При наличии открытых заявок возвращается 409',
      responses: {
        '204': {
          description: 'Оборудование удалено. Тело ответа отсутствует',
        },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
        '409': { $ref: '#/components/responses/Conflict' },
        '422': { $ref: '#/components/responses/ValidationError' },
        ...commonErrors,
      },
    },
  },

  '/api/equipment/{id}/weather': {
    parameters: [
      { $ref: '#/components/parameters/ResourceId' },
    ],

    get: {
      tags: ['Equipment'],
      operationId: 'getEquipmentWeather',
      summary: 'Получить прогноз погоды для оборудования',
      description:
        'Доступно viewer, technician и admin. ' +
        'Прогноз определяется по координатам оборудования',
      responses: {
        '200': jsonResponse(
          'Прогноз и пригодность погоды для наружных работ',
          'EquipmentWeatherResponse',
        ),
        '404': { $ref: '#/components/responses/NotFound' },
        '422': { $ref: '#/components/responses/ValidationError' },
        '502': jsonResponse(
          'Ошибка внешнего сервиса погоды',
          'ErrorResponse',
        ),
        '504': jsonResponse(
          'Истекло время ожидания сервиса погоды',
          'ErrorResponse',
        ),
        ...commonErrors,
      },
    },
  },
};