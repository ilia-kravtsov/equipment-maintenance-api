import type { OpenAPIV3 } from 'openapi-types';

import { schemaRef } from '../helpers.js';

export const requestImportSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  ImportMaintenanceRequestsInput: {
    type: 'object',
    required: ['requests'],
    properties: {
      requests: {
        type: 'array',
        minItems: 1,
        maxItems: 100,
        items: schemaRef('CreateMaintenanceRequestInput'),
      },
    },
  },
  RequestImportError: {
    type: 'object',
    required: ['code', 'message'],
    properties: {
      code: { type: 'string' },
      message: { type: 'string' },
      details: {
        type: 'array',
        items: {
          type: 'object',
          required: ['field', 'message'],
          properties: {
            field: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  RequestImportItemResult: {
    oneOf: [
      {
        type: 'object',
        required: ['index', 'status', 'data'],
        properties: {
          index: { type: 'integer', minimum: 0 },
          status: { type: 'string', enum: ['created'] },
          data: schemaRef('MaintenanceRequest'),
        },
      },
      {
        type: 'object',
        required: ['index', 'status', 'error'],
        properties: {
          index: { type: 'integer', minimum: 0 },
          status: { type: 'string', enum: ['failed'] },
          error: schemaRef('RequestImportError'),
        },
      },
    ],
  },
  RequestImportResult: {
    type: 'object',
    required: ['total', 'created', 'failed', 'results'],
    properties: {
      total: { type: 'integer', minimum: 1 },
      created: { type: 'integer', minimum: 0 },
      failed: { type: 'integer', minimum: 0 },
      results: {
        type: 'array',
        items: schemaRef('RequestImportItemResult'),
      },
    },
  },
};