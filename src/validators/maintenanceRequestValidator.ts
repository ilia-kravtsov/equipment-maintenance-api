import { z } from 'zod';

import {
  requestPriorities,
  requestStatuses,
} from '../models/maintenanceRequest.js';

export const createMaintenanceRequestSchema = z.object({
  equipmentId: z.uuid(),
  title: z.string().min(5).max(120),
  description: z.string().max(2000).optional(),
  priority: z.enum(requestPriorities),
  plannedAt: z.iso.datetime().optional(),
});

export const updateMaintenanceRequestSchema =
  createMaintenanceRequestSchema
    .omit({
      equipmentId: true,
    })
    .partial();

export const updateMaintenanceRequestStatusSchema = z.object({
  status: z.enum(requestStatuses),
});

export const maintenanceRequestListQuerySchema = z.object({
  status: z.enum(requestStatuses).optional(),
  priority: z.enum(requestPriorities).optional(),
  equipmentId: z.uuid().optional(),

  createdFrom: z.iso.datetime().optional(),
  createdTo: z.iso.datetime().optional(),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  sortBy: z
    .enum([
      'createdAt',
      'updatedAt',
      'plannedAt',
      'priority',
      'status',
    ])
    .optional(),

  order: z.enum(['asc', 'desc']).default('asc'),
});