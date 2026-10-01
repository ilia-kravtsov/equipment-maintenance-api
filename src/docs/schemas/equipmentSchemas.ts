import type { OpenAPIV3 } from 'openapi-types';

import {
  equipmentStatuses,
  equipmentTypes,
} from '../../models/equipment/equipment.js';

const equipmentProperties: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {
  name: {
    type: 'string',
    minLength: 3,
    maxLength: 100,
    example: 'Датчик температуры',
  },
  type: {
    type: 'string',
    enum: [...equipmentTypes],
  },
  serialNumber: {
    type: 'string',
    minLength: 1,
    example: 'SENSOR-001',
  },
  location: {
    $ref: '#/components/schemas/EquipmentLocation',
  },
  status: {
    type: 'string',
    enum: [...equipmentStatuses],
  },
  installedAt: {
    type: 'string',
    format: 'date',
    description: 'Дата установки, не позднее текущей даты.',
    example: '2025-01-15',
  },
};

const requiredEquipmentFields = [
  'name',
  'type',
  'serialNumber',
  'location',
  'status',
  'installedAt',
];

export const equipmentSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  EquipmentLocation: {
    type: 'object',
    required: ['lat', 'lon'],
    properties: {
      lat: {
        type: 'number',
        minimum: -90,
        maximum: 90,
        example: 55.7558,
      },
      lon: {
        type: 'number',
        minimum: -180,
        maximum: 180,
        example: 37.6173,
      },
    },
  },

  EquipmentPassport: {
    type: 'object',
    nullable: true,
    description: 'Паспорт оборудования; null, если паспорт отсутствует.',
    required: [
      'equipmentId',
      'manufacturer',
      'model',
      'ratedPowerKw',
      'lastVerifiedAt',
    ],
    properties: {
      equipmentId: {
        type: 'string',
        format: 'uuid',
      },
      manufacturer: {
        type: 'string',
      },
      model: {
        type: 'string',
      },
      ratedPowerKw: {
        type: 'number',
      },
      lastVerifiedAt: {
        type: 'string',
        format: 'date',
        nullable: true,
      },
    },
  },

  CreateEquipmentInput: {
    type: 'object',
    required: requiredEquipmentFields,
    properties: equipmentProperties,
  },

  UpdateEquipmentInput: {
    type: 'object',
    description:
      'Все поля необязательны. Если передано location, нужны обе координаты.',
    properties: equipmentProperties,
  },

  Equipment: {
    type: 'object',
    required: ['id', ...requiredEquipmentFields],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      ...equipmentProperties,
      passport: {
        $ref: '#/components/schemas/EquipmentPassport',
      },
    },
  },

  EquipmentResponse: {
    type: 'object',
    required: ['data'],
    properties: {
      data: {
        $ref: '#/components/schemas/Equipment',
      },
    },
  },

  EquipmentDetailsResponse: {
    type: 'object',
    required: ['data'],
    properties: {
      data: {
        allOf: [
          { $ref: '#/components/schemas/Equipment' },
          {
            type: 'object',
            required: ['passport'],
          },
        ],
      },
    },
  },

  EquipmentListResponse: {
    type: 'object',
    required: ['data', 'meta'],
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Equipment',
        },
      },
      meta: {
        $ref: '#/components/schemas/PaginationMeta',
      },
    },
  },
};