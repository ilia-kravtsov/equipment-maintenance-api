import { z } from 'zod';

export const createSiteSchema = z.strictObject({
  name: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(50),
  region: z.string().trim().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updateSiteSchema = createSiteSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field must be provided',
  });