import 'dotenv/config';

import { once } from 'node:events';
import { createServer } from 'node:http';

import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { sequelize } from './database/sequelize.js';
import { handleDatabaseScriptError } from './database/handleDatabaseScriptError.js';
import { waitForDatabase } from './database/waitForDatabase.js';

const server = createServer(app);

const startupController = new AbortController();

let shuttingDown = false;

const shutdown = async (): Promise<void> => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  startupController.abort();

  logger.info('Server shutdown started');

  const timeout = setTimeout(() => {
    logger.error('Server shutdown timed out');
    process.exit(1);
  }, 8000);

  timeout.unref();

  try {
    try {
      if (server.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error !== undefined) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      }
    } finally {
      await sequelize.close();
    }

    logger.info('HTTP server and database pool closed');
  } catch (error: unknown) {
    handleDatabaseScriptError(error, 'Server shutdown failed');
  } finally {
    clearTimeout(timeout);
  }
};

const start = async (): Promise<void> => {
  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });

  server.listen(config.port);
  await once(server, 'listening');

  logger.info(
    {
      port: config.port,
      environment: config.nodeEnv,
    },
    'HTTP server started',
  );

  await waitForDatabase(sequelize, startupController.signal);
};

start().catch(async (error: unknown) => {
  handleDatabaseScriptError(error, 'Server startup failed');
  await shutdown();
});