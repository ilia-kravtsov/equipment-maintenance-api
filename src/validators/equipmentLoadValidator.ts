import { z } from 'zod';

const integerQuery = (max: number) =>
  z.string()
    .regex(/^\d+$/, 'Expected a non-negative integer')
    .transform(Number)
    .pipe(z.number().int().min(0).max(max));

export const equipmentLoadQuerySchema = z.object({
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
  minRequests: integerQuery(2147483647).default(0),
  limit: integerQuery(100).pipe(z.number().min(1)).default(20),
  offset: integerQuery(10000).default(0),
}).refine(
  (query) =>
    query.from === undefined ||
    query.to === undefined ||
    Date.parse(query.from) <= Date.parse(query.to),
  {
    path: ['to'],
    message: 'Period end must not precede period start',
  },
);