import 'dotenv/config';

import { TEST_API_KEY } from './testConfig.js';

process.env.NODE_ENV = 'test';
process.env.API_KEY = TEST_API_KEY;
process.env.DB_NAME = 'equipment_maintenance_test';