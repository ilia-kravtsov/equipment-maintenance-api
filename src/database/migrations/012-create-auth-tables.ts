import { readRequiredString } from '../../config/env.js';
import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  const username = readRequiredString('DB_USER');

  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `
        CREATE TABLE public.users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email varchar(254) NOT NULL,
          password_hash varchar(255) NOT NULL,
          role varchar(20) NOT NULL DEFAULT 'viewer',
          technician_id uuid,
          created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT users_email_unique UNIQUE (email),

          CONSTRAINT users_email_normalized CHECK (
            email = lower(btrim(email))
            AND char_length(email) > 0
          ),

          CONSTRAINT users_role_check CHECK (
            role IN ('viewer', 'technician', 'admin')
          ),

          CONSTRAINT users_technician_id_unique UNIQUE (technician_id),

          CONSTRAINT users_technician_id_fkey
            FOREIGN KEY (technician_id)
            REFERENCES public.technicians (id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
        );

        CREATE TABLE public.refresh_sessions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL,
          token_hash varchar(64) NOT NULL,
          expires_at timestamptz NOT NULL,
          revoked_at timestamptz,
          created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT refresh_sessions_token_hash_unique UNIQUE (token_hash),

          CONSTRAINT refresh_sessions_token_hash_check CHECK (
            token_hash ~ '^[0-9a-f]{64}$'
          ),

          CONSTRAINT refresh_sessions_expiration_check CHECK (
            expires_at > created_at
          ),

          CONSTRAINT refresh_sessions_user_id_fkey
            FOREIGN KEY (user_id)
            REFERENCES public.users (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE
        );

        CREATE INDEX refresh_sessions_user_id_idx
          ON public.refresh_sessions (user_id);

        CREATE INDEX refresh_sessions_expires_at_idx
          ON public.refresh_sessions (expires_at);
      `,
      { transaction },
    );

    await queryInterface.sequelize.query(
      'SELECT set_config(\'app.migration_role\', $username, true)',
      {
        bind: { username },
        transaction,
      },
    );

    await queryInterface.sequelize.query(
      `
        DO $$
        DECLARE
          role_name text := current_setting('app.migration_role');
        BEGIN
          EXECUTE format(
            'GRANT SELECT, INSERT, UPDATE ON TABLE
              public.users,
              public.refresh_sessions
             TO %I',
            role_name
          );
        END;
        $$;
      `,
      { transaction },
    );
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('refresh_sessions', { transaction });
    await queryInterface.dropTable('users', { transaction });
  });
};