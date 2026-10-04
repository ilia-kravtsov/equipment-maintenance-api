import { z } from 'zod';

export const createTechnicianSchema = z.strictObject({
  fullName: z.string().trim().min(1).max(200),
  specialization: z.string().trim().min(1).max(200),
  employeeNumber: z.string().trim().min(1).max(50),
});

export const updateTechnicianSchema = createTechnicianSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field must be provided',
  });