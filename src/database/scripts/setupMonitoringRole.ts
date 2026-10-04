import 'dotenv/config';

import { readRequiredString } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { createAdminSequelize } from '../createAdminSequelize.js';
import { handleDatabaseScriptError } from '../handleDatabaseScriptError.js';

const setupMonitoringRole = async (): Promise<void> => {
  const username = readRequiredString('GRAFANA_DB_USER');
  const password = readRequiredString('GRAFANA_DB_PASSWORD');

  if (
    username === readRequiredString('DB_USER') ||
    username === readRequiredString('POSTGRES_USER')
  ) {
    throw new Error('GRAFANA_DB_USER must be a separate database role');
  }

  const sequelize = createAdminSequelize();

  try {
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `SELECT
          set_config('app.monitoring_role', $username, true),
          set_config('app.monitoring_password', $password, true)`,
        { bind: { username, password }, transaction },
      );

      await sequelize.query(
        `
          DO $$
          DECLARE
            role_name text := current_setting('app.monitoring_role');
            role_password text := current_setting('app.monitoring_password');
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_roles WHERE rolname = role_name
            ) THEN
              EXECUTE format('CREATE ROLE %I', role_name);
            END IF;

            EXECUTE format(
              'ALTER ROLE %I WITH LOGIN NOSUPERUSER NOCREATEDB
               NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L',
              role_name, role_password
            );

            EXECUTE format(
              'GRANT CONNECT ON DATABASE %I TO %I',
              current_database(), role_name
            );

            EXECUTE format(
              'GRANT USAGE ON SCHEMA public TO %I', role_name
            );

            EXECUTE format(
              'GRANT SELECT ON TABLE
                public.maintenance_requests,
                public.equipment,
                public.request_status_history,
                public.request_assignees
               TO %I',
              role_name
            );
          END
          $$;
        `,
        { transaction },
      );
    });

    logger.info('Monitoring database role configured');
  } finally {
    await sequelize.close();
  }
};

setupMonitoringRole().catch((error: unknown) => {
  handleDatabaseScriptError(error, 'Monitoring database role setup failed');
});