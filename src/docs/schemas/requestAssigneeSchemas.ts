import type { OpenAPIV3 } from 'openapi-types';

export const requestAssigneeSchemas: Record<
  string,
  OpenAPIV3.SchemaObject
> = {
  RequestAssigneeInput: {
    type: 'object',
    required: ['technicianId', 'role', 'hours'],
    properties: {
      technicianId: { type: 'string', format: 'uuid' },
      role: { type: 'string', enum: ['lead', 'member'] },
      hours: {
        type: 'number',
        minimum: 0,
        maximum: 999999.99,
        multipleOf: 0.01,
      },
    },
  },
  AssignRequestAssigneesInput: {
    type: 'object',
    required: ['assignees'],
    properties: {
      assignees: {
        type: 'array',
        maxItems: 100,
        items: { $ref: '#/components/schemas/RequestAssigneeInput' },
      },
    },
  },
  RequestAssignee: {
    allOf: [
      { $ref: '#/components/schemas/RequestAssigneeInput' },
      {
        type: 'object',
        required: ['fullName', 'specialization', 'employeeNumber'],
        properties: {
          fullName: { type: 'string' },
          specialization: { type: 'string' },
          employeeNumber: { type: 'string' },
        },
      },
    ],
  },
};