import 'dotenv/config';

import { Sequelize } from 'sequelize';
import { getDatabaseConfig } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { readRequiredString } from '../../config/env.js';

const setupAppRole = async (): Promise<void> => {
  const config = getDatabaseConfig();

  const owner = readRequiredString('POSTGRES_USER');
  const ownerPassword = readRequiredString('POSTGRES_PASSWORD');

  if (config.username === owner) {
    throw new Error('DB_USER must differ from POSTGRES_USER');
  }

  const sequelize = new Sequelize(
    config.database,
    owner,
    ownerPassword,
    {
      dialect: 'postgres',
      host: config.host,
      port: config.port,
      logging: false,
      pool: {
        max: 1,
        min: 0,
        acquire: config.pool.acquire,
        idle: config.pool.idle,
      },
    },
  );

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
  const original =
    error instanceof Error && 'original' in error
      ? error.original
      : undefined;

  const databaseCode =
    typeof original === 'object' &&
    original !== null &&
    'code' in original &&
    typeof original.code === 'string'
      ? original.code
      : undefined;

  logger.error(
    {
      errorName: error instanceof Error ? error.name : 'UnknownError',
      databaseCode,
      configurationError:
        error instanceof Error && error.constructor === Error
          ? error.message
          : undefined,
    },
    'Application database role setup failed',
  );

  process.exitCode = 1;
});