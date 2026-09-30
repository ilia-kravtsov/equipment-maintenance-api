import { randomUUID } from 'node:crypto';

import { initModels } from '../../src/database/models/initModels.js';
import { sequelize } from '../../src/database/sequelize.js';
import { ConflictError } from '../../src/errors/conflictError.js';
import { PostgresUserRepository } from '../../src/repositories/postgres/users/postgresUserRepository.js';

initModels(sequelize);

const repository = new PostgresUserRepository();

const createInput = () => ({
  email: `user-${randomUUID()}@example.com`,
  passwordHash: 'test-only-password-hash',
});

describe('PostgresUserRepository', () => {
  it('creates a viewer without exposing the password hash', async () => {
    const input = createInput();

    const user = await repository.create(input);

    expect(user).toEqual({
      id: expect.any(String),
      email: input.email,
      role: 'viewer',
      technicianId: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    expect(user).not.toHaveProperty('passwordHash');
    expect(Number.isNaN(Date.parse(user.createdAt))).toBe(false);
    expect(Number.isNaN(Date.parse(user.updatedAt))).toBe(false);
  });

  it('finds a user by ID without exposing the password hash', async () => {
    const created = await repository.create(createInput());

    const user = await repository.findById(created.id);

    expect(user).toEqual(created);
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('returns the stored hash for authentication', async () => {
    const input = createInput();
    const created = await repository.create(input);

    const user = await repository.findByEmailForAuthentication(
      input.email,
    );

    expect(user).toEqual({
      ...created,
      passwordHash: input.passwordHash,
    });
  });

  it('returns undefined for an unknown user', async () => {
    expect(await repository.findById(randomUUID())).toBeUndefined();

    expect(
      await repository.findByEmailForAuthentication(
        `missing-${randomUUID()}@example.com`,
      ),
    ).toBeUndefined();
  });

  it('rejects a duplicate email without replacing the existing user', async () => {
    const input = createInput();
    const created = await repository.create(input);

    await expect(
      repository.create({
        ...input,
        passwordHash: 'another-test-only-hash',
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    const stored = await repository.findByEmailForAuthentication(
      input.email,
    );

    expect(stored?.id).toBe(created.id);
    expect(stored?.passwordHash).toBe(input.passwordHash);
  });
});