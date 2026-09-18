import cors from 'cors';

import { config } from '../config/index.js';

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (origin === undefined || config.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
});
