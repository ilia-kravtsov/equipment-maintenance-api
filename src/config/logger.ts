import pino from 'pino';

import { config } from './index.js';

const defaultLevel = config.nodeEnv === 'production'
  ? 'info'
  : 'debug';

const configuredLevel = process.env.LOG_LEVEL ?? defaultLevel;

const allowedLevels = [
  'fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent',
];

if (!allowedLevels.includes(configuredLevel)) {
  throw new Error('LOG_LEVEL must be a valid Pino log level');
}

export const logger = pino({
  level: config.nodeEnv === 'test' ? 'silent' : configuredLevel,

  redact: {
    paths: [
      'password',
      'passwordHash',
      'accessToken',
      'refreshToken',
      '*.password',
      '*.passwordHash',
      '*.accessToken',
      '*.refreshToken',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'req.body',
    ],
    remove: true,
  },

  ...(config.nodeEnv !== 'production' && config.nodeEnv !== 'test'
    ? {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          singleLine: false,
        },
      },
    }
    : {}),
});