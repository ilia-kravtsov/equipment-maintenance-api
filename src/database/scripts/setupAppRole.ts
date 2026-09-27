import 'dotenv/config';

import { getDatabaseConfig } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { createAdminSequelize } from '../createAdminSequelize.js';
import { handleDatabaseScriptError } from '../handleDatabaseScriptError.js';

const setupAppRole = async (): Promise<void> => {
  const config = getDatabaseConfig();
  const sequelize = createAdminSequelize();

  try {
    await sequelize.authenticate();

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `
          SELECT
            set_config('app.setup_role', $username, true),
            set_config('app.setup_password', $password, true)
        `,
        {
          bind: {
            username: config.username,
            password: config.password,
          },
          transaction,
        },
      );

      await sequelize.query(
        `
          DO $$
          DECLARE
            role_name text := current_setting('app.setup_role');
            role_password text := current_setting('app.setup_password');
          BEGIN
            IF NOT EXISTS (
              SELECT 1
              FROM pg_roles
              WHERE rolname = role_name
            ) THEN
              EXECUTE format('CREATE ROLE %I', role_name);
            END IF;

            EXECUTE format(
              'ALTER ROLE %I WITH LOGIN NOSUPERUSER NOCREATEDB
               NOCREATEROLE NOREPLICATION NOBYPASSRLS
               PASSWORD %L',
              role_name,
              role_password
            );

            EXECUTE format(
              'GRANT CONNECT ON DATABASE %I TO %I',
              current_database(),
              role_name
            );

            EXECUTE format(
              'GRANT USAGE ON SCHEMA public TO %I',
              role_name
            );
          END
          $$;
        `,
        { transaction },
      );
    });

    logger.info('Application database role configured');
  } finally {
    await sequelize.close();
  }
};

setupAppRole().catch((error: unknown) => {
  handleDatabaseScriptError(error, 'Application database role setup failed');
});