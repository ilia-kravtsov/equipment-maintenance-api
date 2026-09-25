import { readRequiredString } from './env.js';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

const readInteger = (
  name: string,
  fallback: number,
  min: number,
  max: number,
): number => {
  const rawValue = process.env[name];

  if (rawValue === undefined) {
    return fallback;
  }

  if (rawValue.trim().length === 0) {
    throw new Error(`${name} must not be empty`);
  }

  const value = Number(rawValue);

  if (
    !Number.isSafeInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(
      `${name} must be an integer between ${min} and ${max}`,
    );
  }

  return value;
};

export const getDatabaseConfig = (): DatabaseConfig => {
  const host = readRequiredString('DB_HOST');
  const database = readRequiredString('DB_NAME');
  const username = readRequiredString('DB_USER');
  const password = readRequiredString('DB_PASSWORD');

  const port = readInteger('DB_PORT', 5432, 1, 65535);

  const max = readInteger('DB_POOL_MAX', 5, 1, 100);
  const min = readInteger('DB_POOL_MIN', 0, 0, 100);

  if (min > max) {
    throw new Error('DB_POOL_MIN must not exceed DB_POOL_MAX');
  }

  const acquire = readInteger(
    'DB_POOL_ACQUIRE_MS',
    30000,
    1,
    300000,
  );

  const idle = readInteger(
    'DB_POOL_IDLE_MS',
    10000,
    1,
    300000,
  );

  return {
    host,
    port,
    database,
    username,
    password,
    pool: {
      max,
      min,
      acquire,
      idle,
    },
  };
};