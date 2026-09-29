import { randomUUID } from 'node:crypto';

import { initModels } from '../src/database/models/initModels.js';
import { RefreshSessionModel } from '../src/database/models/refreshSessionModel.js';
import { UserModel } from '../src/database/models/userModel.js';
import { sequelize } from '../src/database/sequelize.js';
import { UnauthorizedError } from '../src/errors/unauthorizedError.js';
import { PostgresRefreshSessionRepository } from '../src/repositories/postgres/auth/postgresRefreshSessionRepository.js';
import { PostgresUserRepository } from '../src/repositories/postgres/users/postgresUserRepository.js';
import { verifyAccessToken } from '../src/security/accessToken.js';
import { verifyPassword } from '../src/security/password.js';
import { hashRefreshToken } from '../src/security/refreshToken.js';
import { AuthService } from '../src/services/authService.js';

initModels(sequelize);

const userRepository = new PostgresUserRepository();
const sessionRepository = new PostgresRefreshSessionRepository();

const service = new AuthService(
  userRepository,
  sessionRepository,
);

const createCredentials = () => ({
  email: `auth-${randomUUID()}@example.com`,
  password: 'Example-password-123',
});

const registerAndLogin = async () => {
  const credentials = createCredentials();

  await service.register(credentials);

  return service.login(credentials);
};

describe('AuthService', () => {
  it('registers a viewer with a normalized email and a bcrypt hash', async () => {
    const credentials = createCredentials();

    const user = await service.register({
      email: `  ${credentials.email.toUpperCase()}  `,
      password: credentials.password,
    });

    expect(user.email).toBe(credentials.email);
    expect(user.role).toBe('viewer');
    expect(user.technicianId).toBeNull();
    expect(user).not.toHaveProperty('passwordHash');

    const stored =
      await userRepository.findByEmailForAuthentication(
        credentials.email,
      );

    if (stored === undefined) {
      throw new Error('Expected the registered user to exist');
    }

    expect(stored.passwordHash).not.toBe(credentials.password);

    expect(
      await verifyPassword(
        credentials.password,
        stored.passwordHash,
      ),
    ).toBe(true);
  });

  it('logs in and stores only the refresh token hash', async () => {
    const credentials = createCredentials();
    const registered = await service.register(credentials);

    const result = await service.login({
      email: credentials.email.toUpperCase(),
      password: credentials.password,
    });

    expect(result.user).toEqual(registered);
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.accessTokenExpiresIn).toBe(900);

    expect(
      await service.authenticate(result.accessToken),
    ).toEqual(registered);

    const identity = verifyAccessToken(result.accessToken);
    const stored = await RefreshSessionModel.findByPk(
      identity.sessionId,
    );

    expect(stored?.tokenHash).toBe(
      hashRefreshToken(result.refreshToken),
    );
    expect(stored?.tokenHash).not.toBe(result.refreshToken);
  });

  it('returns the same error for an unknown email and a wrong password', async () => {
    const credentials = createCredentials();

    await service.register(credentials);

    await expect(
      service.login({
        ...credentials,
        password: 'Wrong-password-123',
      }),
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'Invalid email or password',
    });

    await expect(
      service.login({
        email: `missing-${randomUUID()}@example.com`,
        password: credentials.password,
      }),
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'Invalid email or password',
    });
  });

  it('rotates refresh tokens without extending the session lifetime', async () => {
    const original = await registerAndLogin();

    const refreshed = await service.refresh(original.refreshToken);

    expect(refreshed.refreshToken).not.toBe(original.refreshToken);
    expect(refreshed.refreshTokenExpiresAt).toBe(
      original.refreshTokenExpiresAt,
    );

    expect(
      verifyAccessToken(refreshed.accessToken).sessionId,
    ).toBe(
      verifyAccessToken(original.accessToken).sessionId,
    );

    expect(
      await service.authenticate(refreshed.accessToken),
    ).toEqual(original.user);

    await expect(
      service.refresh(original.refreshToken),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('revokes only the logged-out session and invalidates its access token', async () => {
    const credentials = createCredentials();

    await service.register(credentials);

    const first = await service.login(credentials);
    const second = await service.login(credentials);

    await service.logout(first.refreshToken);
    await service.logout(first.refreshToken);

    await expect(
      service.authenticate(first.accessToken),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    await expect(
      service.refresh(first.refreshToken),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(
      await service.authenticate(second.accessToken),
    ).toEqual(second.user);
  });

  it('loads the current role instead of relying on token claims', async () => {
    const result = await registerAndLogin();

    await UserModel.update(
      { role: 'admin' },
      { where: { id: result.user.id } },
    );

    const user = await service.authenticate(result.accessToken);

    expect(user.role).toBe('admin');
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('rejects missing or malformed refresh tokens and permits logout without a cookie', async () => {
    await expect(
      service.refresh(undefined),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    await expect(
      service.refresh('invalid-token'),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    await expect(service.logout(undefined)).resolves.toBeUndefined();
    await expect(service.logout('invalid-token')).resolves.toBeUndefined();
  });
});