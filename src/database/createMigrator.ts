import { extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { QueryInterface, Sequelize } from 'sequelize';
import {
  Umzug,
  SequelizeStorage,
  type MigrationFn,
} from 'umzug';

import { logger } from '../config/logger.js';

export type Migration = MigrationFn<QueryInterface>;

interface MigrationModule {
  up: Migration;
  down: Migration;
}

export const createMigrator = (
  sequelize: Sequelize,
): Umzug<QueryInterface> => {
  const extension = extname(fileURLToPath(import.meta.url));

  const migrationsDirectory = fileURLToPath(
    new URL('./migrations/', import.meta.url),
  );

  return new Umzug<QueryInterface>({
    migrations: {
      glob: [
        `[0-9]*${extension}`,
        {
          cwd: migrationsDirectory,
          ignore: ['*.d.ts'],
        },
      ],

      resolve: ({ name, path }) => {
        if (path === undefined) {
          throw new Error(`Migration path is missing: ${name}`);
        }

        const migrationUrl = pathToFileURL(path).href;

        const loadMigration = async (): Promise<MigrationModule> => {
          const migration = (await import(migrationUrl)) as MigrationModule;

          if (
            typeof migration.up !== 'function' ||
            typeof migration.down !== 'function'
          ) {
            throw new Error(
              `Migration must export up and down functions: ${name}`,
            );
          }

          return migration;
        };

        const up: Migration = async (params) => {
          const migration = await loadMigration();

          return migration.up(params);
        };

        const down: Migration = async (params) => {
          const migration = await loadMigration();

          return migration.down(params);
        };

        return {
          name: name.slice(0, -extension.length),
          up,
          down,
        };
      },
    },

    context: sequelize.getQueryInterface(),

    storage: new SequelizeStorage({
      sequelize,
      tableName: 'SequelizeMeta',
    }),

    logger: {
      info: (event) => logger.info(event),
      warn: (event) => logger.warn(event),
      error: (event) => logger.error(event),
      debug: (event) => logger.debug(event),
    },
  });
};