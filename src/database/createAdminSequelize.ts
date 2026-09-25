import { Sequelize } from 'sequelize';

import { getDatabaseConfig } from '../config/database.js';
import { readRequiredString } from '../config/env.js';

export const createAdminSequelize = (): Sequelize => {
  const config = getDatabaseConfig();

  const username = readRequiredString('POSTGRES_USER');
  const password = readRequiredString('POSTGRES_PASSWORD');

  if (username === config.username) {
    throw new Error('DB_USER must differ from POSTGRES_USER');
  }

  return new Sequelize(
    config.database,
    username,
    password,
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
};