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