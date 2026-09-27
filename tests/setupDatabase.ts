import { sequelize } from '../src/database/sequelize.js';
import {
  resetTestDatabase,
  testAdminSequelize,
} from './database.js';

beforeAll(async () => {
  await resetTestDatabase();
  await sequelize.authenticate();
}, 30000);

afterAll(async () => {
  try {
    await sequelize.close();
  } finally {
    await testAdminSequelize.close();
  }
}, 30000);