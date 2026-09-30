import 'dotenv/config';

import { readRequiredString } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { bootstrapAdmin } from '../bootstrapAdmin.js';
import { createAdminSequelize } from '../createAdminSequelize.js';
import { handleDatabaseScriptError } from '../handleDatabaseScriptError.js';

const run = async (): Promise<void> => {
  const email = readRequiredString('BOOTSTRAP_ADMIN_EMAIL');
  const password = readRequiredString('BOOTSTRAP_ADMIN_PASSWORD');

  const sequelize = createAdminSequelize();

  try {
    await sequelize.authenticate();

    const result = await bootstrapAdmin(sequelize, {
      email,
      password,
    });

    logger.info(
      { result },
      result === 'created'
        ? 'Initial administrator created'
        : 'Initial administrator already exists; credentials unchanged',
    );
  } finally {
    await sequelize.close();
  }
};

run().catch((error: unknown) => {
  handleDatabaseScriptError(
    error,
    'Administrator bootstrap failed',
  );
});