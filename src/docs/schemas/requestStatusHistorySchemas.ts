import type { OpenAPIV3 } from 'openapi-types';

import { requestStatuses } from '../../models/requests/maintenanceRequest.js';

export const requestStatusHistorySchemas: Record<
  string,
  OpenAPIV3.SchemaObject
> = {
  RequestStatusHistory: {
    type: 'object',
    required: [
      'id', 'requestId', 'previousStatus', 'newStatus',
      'changedBy', 'comment', 'changedAt',
    ],
    properties: {
      id: { type: 'string', format: 'uuid' },
      requestId: { type: 'string', format: 'uuid' },
      previousStatus: {
        type: 'string',
        nullable: true,
        enum: [...requestStatuses, null],
      },
      newStatus: { $ref: '#/components/schemas/RequestStatus' },
      changedBy: { type: 'string' },
      comment: { type: 'string', nullable: true },
      changedAt: { type: 'string', format: 'date-time' },
    },
  },
};