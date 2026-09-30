import { QueryTypes, type Sequelize } from 'sequelize';

import type { RegisterUserInput } from '../models/auth/user.js';
import { hashPassword } from '../security/password.js';
import { registerUserSchema } from '../validators/authValidator.js';

export type BootstrapAdminResult = 'created' | 'skipped';

export const bootstrapAdmin = async (
  sequelize: Sequelize,
  input: RegisterUserInput,
): Promise<BootstrapAdminResult> => {
  const credentials = registerUserSchema.parse(input);
  const passwordHash = await hashPassword(credentials.password);

  return sequelize.transaction(async (transaction) => {
    const created = await sequelize.query<{ id: string }>(
      `
        INSERT INTO public.users (
          email,
          password_hash,
          role
        )
        VALUES ($email, $passwordHash, 'admin')
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `,
      {
        bind: {
          email: credentials.email,
          passwordHash,
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    );

    if (created.length > 0) {
      return 'created';
    }

    const existing = await sequelize.query<{ role: string }>(
      `
        SELECT role
        FROM public.users
        WHERE email = $email
        FOR UPDATE
      `,
      {
        bind: {
          email: credentials.email,
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    );

    if (existing[0]?.role !== 'admin') {
      throw new Error(
        'Bootstrap admin email is already used by a non-admin account',
      );
    }

    return 'skipped';
  });
};