import 'dotenv/config';
import { logger } from '../../config/logger.js';
import { createAdminSequelize } from '../createAdminSequelize.js';
import { createMigrator } from '../createMigrator.js';
import { handleDatabaseScriptError } from '../handleDatabaseScriptError.js';

const run = async (): Promise<void> => {
  const command = process.argv[2];

  if (
    command !== 'status' &&
    command !== 'up' &&
    command !== 'down' &&
    command !== 'down-all'
  ) {
    throw new Error('Expected migration command: status, up, down, down-all');
  }

  const sequelize = createAdminSequelize();

  try {
    await sequelize.authenticate();

    const migrator = createMigrator(sequelize);

    switch (command) {
      case 'status': {
        const executed = await migrator.executed();
        const pending = await migrator.pending();

        logger.info(
          {
            executed: executed.map((migration) => migration.name),
            pending: pending.map((migration) => migration.name),
          },
          'Database migration status',
        );

        break;
      }

      case 'up':
        await migrator.up();
        logger.info('Database migrations applied');
        break;

      case 'down':
        await migrator.down();
        logger.info('Last database migration rolled back');
        break;

      case 'down-all':
        await migrator.down({ to: 0 });
        logger.info('All database migrations rolled back');
        break;
    }
  } finally {
    await sequelize.close();
  }
};

run().catch((error: unknown) => {
  handleDatabaseScriptError(error, 'Database migration command failed');
});