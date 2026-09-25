import { Sequelize } from 'sequelize';

import { getDatabaseConfig } from '../config/database.js';

const config = getDatabaseConfig();

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    dialect: 'postgres',
    host: config.host,
    port: config.port,
    pool: config.pool,
    logging: false,
  },
);