import { readRequiredString } from '../../config/env.js';
import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  const username = readRequiredString('DB_USER');

  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `SELECT set_config('app.migration_role', $username, true)`,
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
            'GRANT INSERT, UPDATE, DELETE ON TABLE
              public.sites,
              public.technicians
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
  const username = readRequiredString('DB_USER');

  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `SELECT set_config('app.migration_role', $username, true)`,
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
            'REVOKE INSERT, UPDATE, DELETE ON TABLE
              public.sites,
              public.technicians
             FROM %I',
            role_name
          );
        END;
        $$;
      `,
      { transaction },
    );
  });
};