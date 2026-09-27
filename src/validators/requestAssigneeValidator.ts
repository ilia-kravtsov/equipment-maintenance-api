import { z } from 'zod';

const requestAssigneeSchema = z.object({
  technicianId: z.uuid(),
  role: z.enum(['lead', 'member']),
  hours: z.number().min(0).max(999999.99).multipleOf(0.01),
});

export const assignRequestAssigneesSchema = z.object({
  assignees: z.array(requestAssigneeSchema).max(100),
});

export const removeRequestAssigneeParamsSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
});