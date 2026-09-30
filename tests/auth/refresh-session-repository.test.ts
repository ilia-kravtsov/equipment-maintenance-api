import { randomBytes, randomUUID } from 'node:crypto';

import { initModels } from '../../src/database/models/initModels.js';
import { RefreshSessionModel } from '../../src/database/models/refreshSessionModel.js';
import { sequelize } from '../../src/database/sequelize.js';
import { PostgresRefreshSessionRepository } from '../../src/repositories/postgres/auth/postgresRefreshSessionRepository.js';
import { PostgresUserRepository } from '../../src/repositories/postgres/users/postgresUserRepository.js';

initModels(sequelize);

const sessionRepository = new PostgresRefreshSessionRepository();
const userRepository = new PostgresUserRepository();

const createTokenHash = (): string => {
  return randomBytes(32).toString('hex');
};

const createSession = async () => {
  const user = await userRepository.create({
    email: `session-${randomUUID()}@example.com`,
    passwordHash: 'test-only-password-hash',
  });

  return sessionRepository.create({
    userId: user.id,
    tokenHash: createTokenHash(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });
};

describe('PostgresRefreshSessionRepository', () => {
  it('creates and finds an active session', async () => {
    const session = await createSession();

    expect(session.revokedAt).toBeNull();

    expect(
      await sessionRepository.findActiveById(session.id),
    ).toEqual(session);
  });

  it('rotates the token and rejects reuse of the previous token', async () => {
    const session = await createSession();
    const nextTokenHash = createTokenHash();

    const rotated = await sessionRepository.rotate(
      session.tokenHash,
      nextTokenHash,
    );

    expect(rotated).toMatchObject({
      id: session.id,
      userId: session.userId,
      tokenHash: nextTokenHash,
      expiresAt: session.expiresAt,
      revokedAt: null,
    });

    expect(
      await sessionRepository.rotate(
        session.tokenHash,
        createTokenHash(),
      ),
    ).toBeUndefined();
  });

  it('allows only one concurrent rotation of the same token', async () => {
    const session = await createSession();

    const results = await Promise.all([
      sessionRepository.rotate(session.tokenHash, createTokenHash()),
      sessionRepository.rotate(session.tokenHash, createTokenHash()),
    ]);

    const successful = results.filter(
      (result) => result !== undefined,
    );

    expect(successful).toHaveLength(1);

    const stored = await sessionRepository.findActiveById(session.id);

    expect(stored?.tokenHash).toBe(successful[0]?.tokenHash);
  });

  it('revokes a session and permits repeated logout', async () => {
    const session = await createSession();

    await sessionRepository.revokeByTokenHash(session.tokenHash);
    await sessionRepository.revokeByTokenHash(session.tokenHash);

    expect(
      await sessionRepository.findActiveById(session.id),
    ).toBeUndefined();

    expect(
      await sessionRepository.rotate(
        session.tokenHash,
        createTokenHash(),
      ),
    ).toBeUndefined();

    const stored = await RefreshSessionModel.findByPk(session.id);

    expect(stored).not.toBeNull();
    expect(stored?.revokedAt).toBeInstanceOf(Date);
  });

  it('does not return or rotate an expired session', async () => {
    const session = await createSession();
    const now = Date.now();

    await RefreshSessionModel.update(
      {
        createdAt: new Date(now - 2 * 60 * 60 * 1000),
        expiresAt: new Date(now - 60 * 60 * 1000),
      },
      {
        where: { id: session.id },
      },
    );

    expect(
      await sessionRepository.findActiveById(session.id),
    ).toBeUndefined();

    expect(
      await sessionRepository.rotate(
        session.tokenHash,
        createTokenHash(),
      ),
    ).toBeUndefined();
  });

  it('returns undefined for an unknown session or token', async () => {
    expect(
      await sessionRepository.findActiveById(randomUUID()),
    ).toBeUndefined();

    expect(
      await sessionRepository.rotate(
        createTokenHash(),
        createTokenHash(),
      ),
    ).toBeUndefined();
  });
});