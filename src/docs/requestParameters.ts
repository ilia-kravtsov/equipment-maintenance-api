import type { OpenAPIV3 } from 'openapi-types';

import {
  requestPriorities,
  requestStatuses,
} from '../models/requests/maintenanceRequest.js';

const query = (
  name: string,
  schema: OpenAPIV3.SchemaObject,
): OpenAPIV3.ParameterObject => ({
  name,
  in: 'query',
  schema,
});

export const requestListParameters: Array<
  OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject
> = [
  { $ref: '#/components/parameters/Page' },
  { $ref: '#/components/parameters/PageLimit' },
  { $ref: '#/components/parameters/SortOrder' },
  query('status', { type: 'string', enum: [...requestStatuses] }),
  query('priority', { type: 'string', enum: [...requestPriorities] }),
  query('equipmentId', { type: 'string', format: 'uuid' }),
  query('createdFrom', { type: 'string', format: 'date-time' }),
  query('createdTo', { type: 'string', format: 'date-time' }),
  query('sortBy', {
    type: 'string',
    enum: ['createdAt', 'updatedAt', 'plannedAt', 'priority', 'status'],
  }),
];