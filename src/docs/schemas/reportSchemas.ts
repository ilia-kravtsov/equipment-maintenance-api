import type { OpenAPIV3 } from 'openapi-types';

import {
  requestPriorities,
  requestStatuses,
} from '../../models/requests/maintenanceRequest.js';

const count: OpenAPIV3.SchemaObject = {
  type: 'integer',
  minimum: 0,
};

const counts = (keys: readonly string[]): OpenAPIV3.SchemaObject => ({
  type: 'object',
  required: [...keys],
  properties: Object.fromEntries(keys.map((key) => [key, count])),
});

export const reportSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  SiteSummary: {
    type: 'object',
    required: [
      'siteId', 'totalRequests', 'byStatus',
      'byPriority', 'averageClosureHours',
    ],
    properties: {
      siteId: { type: 'string', format: 'uuid' },
      totalRequests: count,
      byStatus: counts(requestStatuses),
      byPriority: counts(requestPriorities),
      averageClosureHours: {
        type: 'number',
        nullable: true,
        description: 'Среднее время до done в часах; null при отсутствии данных',
      },
    },
  },
  EquipmentLoad: {
    type: 'object',
    required: [
      'equipmentId', 'equipmentName', 'serialNumber',
      'requestCount', 'closedRequestCount',
      'totalPlannedHours', 'lastServiceAt',
    ],
    properties: {
      equipmentId: { type: 'string', format: 'uuid' },
      equipmentName: { type: 'string' },
      serialNumber: { type: 'string' },
      requestCount: count,
      closedRequestCount: {
        ...count,
        description: 'Количество заявок в статусе done',
      },
      totalPlannedHours: {
        type: 'number',
        minimum: 0,
        description: 'Сумма часов назначенных исполнителей',
      },
      lastServiceAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Последний переход в done среди выбранных заявок',
      },
    },
  },
};