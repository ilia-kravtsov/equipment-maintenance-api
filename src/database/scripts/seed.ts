import 'dotenv/config';

import { logger } from '../../config/logger.js';
import { createAdminSequelize } from '../createAdminSequelize.js';
import { handleDatabaseScriptError } from '../handleDatabaseScriptError.js';
import { loadDemoData } from '../seeds/loadDemoData.js';

const seed = async (): Promise<void> => {
  const sequelize = createAdminSequelize();

  try {
    await sequelize.authenticate();

    const result = await loadDemoData(sequelize);

    if (result === 'skipped') {
      logger.info('Demonstration data already loaded, skipping');
      return;
    }

    logger.info('Demonstration data loaded successfully');
  } finally {
    await sequelize.close();
  }
};

seed().catch((error: unknown) => {
  handleDatabaseScriptError(error, 'Database seeding failed');
});