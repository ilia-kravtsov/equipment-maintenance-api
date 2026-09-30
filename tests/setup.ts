import 'dotenv/config';

import { TEST_API_KEY } from './testConfig.js';

process.env.NODE_ENV = 'test';
process.env.API_KEY = TEST_API_KEY;
process.env.DB_NAME = 'equipment_maintenance_test';

process.env.ACCESS_TOKEN_SECRET =
  'uftu-pomz-bdftt-uplfo-tfdsfu-opu-gps-qspevdujpo';
process.env.ACCESS_TOKEN_TTL_SECONDS = '900';
process.env.REFRESH_SESSION_TTL_DAYS = '7';
process.env.BCRYPT_ROUNDS = '10';