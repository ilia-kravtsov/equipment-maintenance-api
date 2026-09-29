import { z } from 'zod';

import { readRequiredString } from './env.js';

const authConfigSchema = z.object({
  accessTokenSecret: z.string().min(32),
  accessTokenTtlSeconds: z.coerce.number().int().min(60).max(3600)
    .default(900),
  refreshSessionTtlDays: z.coerce.number().int().min(1).max(90)
    .default(7),
  bcryptRounds: z.coerce.number().int().min(10).max(14)
    .default(12),
});

export const getAuthConfig = () => {
  return authConfigSchema.parse({
    accessTokenSecret: readRequiredString('ACCESS_TOKEN_SECRET'),
    accessTokenTtlSeconds: process.env.ACCESS_TOKEN_TTL_SECONDS,
    refreshSessionTtlDays: process.env.REFRESH_SESSION_TTL_DAYS,
    bcryptRounds: process.env.BCRYPT_ROUNDS,
  });
};