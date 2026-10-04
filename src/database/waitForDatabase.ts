import { setTimeout } from 'node:timers/promises';

import { logger } from '../config/logger.js';

interface DatabaseConnection {
  authenticate(): Promise<void>;
}

export const waitForDatabase = async (
  database: DatabaseConnection,
  signal: AbortSignal,
): Promise<void> => {
  let attempt = 0;

  while (!signal.aborted) {
    attempt += 1;

    try {
      await database.authenticate();

      if (!signal.aborted) {
        logger.info('Database connection established');
      }

      return;
    } catch {
      if (signal.aborted) {
        return;
      }

      logger.warn(
        { attempt, retryDelayMs: 2000 },
        'Database unavailable; retrying connection',
      );
    }

    try {
      await setTimeout(2000, undefined, { signal });
    } catch (error: unknown) {
      if (signal.aborted) {
        return;
      }

      throw error;
    }
  }
};