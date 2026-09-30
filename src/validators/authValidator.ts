import { z } from 'zod';

import { MAX_PASSWORD_BYTES } from '../security/password.js';

const emailSchema = z.string()
  .trim()
  .toLowerCase()
  .max(254)
  .email();

const passwordSchema = z.string()
  .min(1)
  .max(MAX_PASSWORD_BYTES)
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= MAX_PASSWORD_BYTES,
    {
      message: `Password must not exceed ${MAX_PASSWORD_BYTES} UTF-8 bytes`,
    },
  );

export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema.refine(
    (value) => value.length >= 8,
    {
      message: 'Password must contain at least 8 characters',
    },
  ),
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
}).strict();