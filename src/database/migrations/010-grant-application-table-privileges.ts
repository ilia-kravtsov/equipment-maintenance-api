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
            'GRANT SELECT ON TABLE
              public.sites,
              public.technicians,
              public.equipment_passports
             TO %I',
            role_name
          );

          EXECUTE format(
            'GRANT SELECT, INSERT, UPDATE ON TABLE
              public.equipment,
              public.maintenance_requests
             TO %I',
            role_name
          );

          EXECUTE format(
            'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
              public.request_assignees
             TO %I',
            role_name
          );

          EXECUTE format(
            'GRANT SELECT, INSERT ON TABLE
              public.request_status_history
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
            'REVOKE SELECT ON TABLE
              public.sites,
              public.technicians,
              public.equipment_passports
             FROM %I',
            role_name
          );

          EXECUTE format(
            'REVOKE SELECT, INSERT, UPDATE ON TABLE
              public.equipment,
              public.maintenance_requests
             FROM %I',
            role_name
          );

          EXECUTE format(
            'REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE
              public.request_assignees
             FROM %I',
            role_name
          );

          EXECUTE format(
            'REVOKE SELECT, INSERT ON TABLE
              public.request_status_history
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