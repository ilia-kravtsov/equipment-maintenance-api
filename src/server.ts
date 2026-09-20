import 'dotenv/config';

import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './config/logger.js';

app.listen(config.port, () => {
  logger.info(
    {
      port: config.port,
      environment: config.nodeEnv,
    },
    'Server started',
  );
});