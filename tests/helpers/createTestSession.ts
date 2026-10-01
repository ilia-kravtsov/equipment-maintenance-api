import { randomUUID } from 'node:crypto';

import { initModels } from '../../src/database/models/initModels.js';
import { sequelize } from '../../src/database/sequelize.js';
import type { AuthSessionResult } from '../../src/models/auth/auth.js';
import type { UserRole } from '../../src/models/auth/user.js';
import { PostgresRefreshSessionRepository } from '../../src/repositories/postgres/auth/postgresRefreshSessionRepository.js';
import { PostgresUserRepository } from '../../src/repositories/postgres/users/postgresUserRepository.js';
import { AuthService } from '../../src/services/authService.js';
import { testAdminSequelize } from '../database.js';

export const createTestSession = async (
  role: UserRole = 'viewer',
  technicianId: string | null = null,
): Promise<AuthSessionResult> => {
  if (
    process.env.NODE_ENV !== 'test' ||
    testAdminSequelize.getDatabaseName() !== 'equipment_maintenance_test' ||
    sequelize.getDatabaseName() !== 'equipment_maintenance_test'
  ) {
    throw new Error('Test sessions require the test database');
  }

  initModels(sequelize);

  const authService = new AuthService(
    new PostgresUserRepository(),
    new PostgresRefreshSessionRepository(),
  );

  const credentials = {
    email: `test-${randomUUID()}@example.com`,
    password: 'Test-password-123',
  };

  const user = await authService.register(credentials);

  await testAdminSequelize.query(
    `UPDATE public.users
     SET role = $role,
         technician_id = $technicianId,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $userId`,
    {
      bind: {
        userId: user.id,
        role,
        technicianId,
      },
    },
  );

  return authService.login(credentials);
};