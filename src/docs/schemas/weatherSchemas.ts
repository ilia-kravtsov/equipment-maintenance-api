import type { OpenAPIV3 } from 'openapi-types';

export const weatherSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  EquipmentWeatherDay: {
    type: 'object',
    required: [
      'date',
      'temperatureMax',
      'temperatureMin',
      'precipitation',
      'windSpeedMax',
      'suitableForOutdoorWork',
    ],
    properties: {
      date: {
        type: 'string',
        format: 'date',
      },
      temperatureMax: {
        type: 'number',
        description: 'Максимальная температура, °C',
      },
      temperatureMin: {
        type: 'number',
        description: 'Минимальная температура, °C',
      },
      precipitation: {
        type: 'number',
        description: 'Сумма осадков, мм',
      },
      windSpeedMax: {
        type: 'number',
        description: 'Максимальная скорость ветра',
      },
      suitableForOutdoorWork: {
        type: 'boolean',
        description: 'Допустимость работ на открытом воздухе',
      },
    },
  },

  EquipmentWeather: {
    type: 'object',
    required: ['equipmentId', 'location', 'timezone', 'days'],
    properties: {
      equipmentId: {
        type: 'string',
        format: 'uuid',
      },
      location: {
        $ref: '#/components/schemas/EquipmentLocation',
      },
      timezone: {
        type: 'string',
        example: 'Europe/Moscow',
      },
      days: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/EquipmentWeatherDay',
        },
      },
    },
  },

  EquipmentWeatherResponse: {
    type: 'object',
    required: ['data'],
    properties: {
      data: {
        $ref: '#/components/schemas/EquipmentWeather',
      },
    },
  },
};