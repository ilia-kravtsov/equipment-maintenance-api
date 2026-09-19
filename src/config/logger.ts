import pino from 'pino';

import { config } from './index.js';

export const logger =
  config.nodeEnv === 'production'
    ? pino({
      level: 'info',
    })
    : pino({
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          singleLine: false,
        },
      },
    });