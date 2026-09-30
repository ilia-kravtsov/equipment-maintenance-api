import { randomUUID } from 'node:crypto';

import { bootstrapAdmin } from '../src/database/bootstrapAdmin.js';
import { initModels } from '../src/database/models/initModels.js';
import { sequelize } from '../src/database/sequelize.js';
import { PostgresUserRepository } from '../src/repositories/postgres/users/postgresUserRepository.js';
import { verifyPassword } from '../src/security/password.js';
import { testAdminSequelize } from './database.js';

initModels(sequelize);

const userRepository = new PostgresUserRepository();

const createCredentials = () => ({
  email: `bootstrap-${randomUUID()}@example.com`,
  password: 'Initial-admin-password-123',
});

describe('Administrator bootstrap', () => {
  it('creates an administrator with a normalized email and hashed password', async () => {
    const credentials = createCredentials();

    const result = await bootstrapAdmin(testAdminSequelize, {
      ...credentials,
      email: `  ${credentials.email.toUpperCase()}  `,
    });

    expect(result).toBe('created');

    const user = await userRepository.findByEmailForAuthentication(
      credentials.email,
    );

    if (user === undefined) {
      throw new Error('Expected the administrator to exist');
    }

    expect(user.role).toBe('admin');
    expect(user.technicianId).toBeNull();

    expect(
      await verifyPassword(credentials.password, user.passwordHash),
    ).toBe(true);
  });

  it('does not replace the administrator password on repeated execution', async () => {
    const credentials = createCredentials();

    await bootstrapAdmin(testAdminSequelize, credentials);

    const before = await userRepository.findByEmailForAuthentication(
      credentials.email,
    );

    const result = await bootstrapAdmin(testAdminSequelize, {
      ...credentials,
      password: 'Another-admin-password-456',
    });

    const after = await userRepository.findByEmailForAuthentication(
      credentials.email,
    );

    expect(result).toBe('skipped');
    expect(before).toBeDefined();
    expect(after).toEqual(before);
  });

  it('does not promote an existing viewer', async () => {
    const credentials = createCredentials();

    const viewer = await userRepository.create({
      email: credentials.email,
      passwordHash: 'test-only-viewer-hash',
    });

    await expect(
      bootstrapAdmin(testAdminSequelize, credentials),
    ).rejects.toThrow(
      'Bootstrap admin email is already used by a non-admin account',
    );

    const stored = await userRepository.findByEmailForAuthentication(
      credentials.email,
    );

    expect(stored?.id).toBe(viewer.id);
    expect(stored?.role).toBe('viewer');
    expect(stored?.passwordHash).toBe('test-only-viewer-hash');
  });

  it('rejects an invalid password without creating a user', async () => {
    const credentials = createCredentials();

    await expect(
      bootstrapAdmin(testAdminSequelize, {
        ...credentials,
        password: 'short',
      }),
    ).rejects.toThrow();

    expect(
      await userRepository.findByEmailForAuthentication(
        credentials.email,
      ),
    ).toBeUndefined();
  });
});