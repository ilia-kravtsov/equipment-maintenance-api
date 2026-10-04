import type { OpenAPIV3 } from 'openapi-types';

import {
  requestPriorities,
  requestStatuses,
} from '../../models/requests/maintenanceRequest.js';

const editableProperties: Record<string, OpenAPIV3.SchemaObject> = {
  title: { type: 'string', minLength: 5, maxLength: 120 },
  description: { type: 'string', maxLength: 2000 },
  priority: { type: 'string', enum: [...requestPriorities] },
  plannedAt: { type: 'string', format: 'date-time' },
};

export const maintenanceRequestSchemas: Record<
  string,
  OpenAPIV3.SchemaObject
> = {
  RequestStatus: {
    type: 'string',
    enum: [...requestStatuses],
  },
  CreateMaintenanceRequestInput: {
    type: 'object',
    required: ['equipmentId', 'title', 'priority'],
    properties: {
      equipmentId: { type: 'string', format: 'uuid' },
      ...editableProperties,
    },
  },
  UpdateMaintenanceRequestInput: {
    type: 'object',
    properties: editableProperties,
  },
  UpdateMaintenanceRequestStatusInput: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { $ref: '#/components/schemas/RequestStatus' },
    },
  },
  MaintenanceRequest: {
    type: 'object',
    required: [
      'id', 'equipmentId', 'title', 'priority',
      'status', 'createdAt', 'updatedAt',
    ],
    properties: {
      id: { type: 'string', format: 'uuid' },
      equipmentId: { type: 'string', format: 'uuid' },
      ...editableProperties,
      status: { $ref: '#/components/schemas/RequestStatus' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      assignees: {
        type: 'array',
        items: { $ref: '#/components/schemas/RequestAssignee' },
      },
    },
  },
};