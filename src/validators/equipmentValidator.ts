import { z } from 'zod';

import {
  equipmentStatuses,
  equipmentTypes,
} from '../models/equipment.js';

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const createEquipmentSchema = z.object({
  name: z.string().min(3).max(100),
  type: z.enum(equipmentTypes),
  serialNumber: z.string().min(1),
  location: locationSchema,
  status: z.enum(equipmentStatuses),
  installedAt: z.iso.date().refine(
    (date) => new Date(date) <= new Date(),
    {
      message: 'Invalid installation date',
    },
  ),
});

export const updateEquipmentSchema = createEquipmentSchema.partial();