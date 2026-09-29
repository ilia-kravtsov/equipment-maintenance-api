import { randomUUID } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { getAuthConfig } from '../src/config/auth.js';
import { UnauthorizedError } from '../src/errors/unauthorizedError.js';
import {
  signAccessToken,
  verifyAccessToken,
} from '../src/security/accessToken.js';
import {
  hashPassword,
  verifyPassword,
} from '../src/security/password.js';
import {
  generateRefreshToken,
  hashRefreshToken,
} from '../src/security/refreshToken.js';

describe('Password security', () => {
  it('uses a different salt and verifies the password', async () => {
    const password = 'Example-password-123';

    const firstHash = await hashPassword(password);
    const secondHash = await hashPassword(password);

    expect(firstHash).not.toBe(password);
    expect(firstHash).not.toBe(secondHash);

    expect(await verifyPassword(password, firstHash)).toBe(true);
    expect(await verifyPassword(password, secondHash)).toBe(true);
    expect(await verifyPassword('wrong-password', firstHash)).toBe(false);
  });

  it('rejects passwords exceeding 72 UTF-8 bytes', async () => {
    const password = 'я'.repeat(37);

    expect(Buffer.byteLength(password, 'utf8')).toBe(74);

    await expect(hashPassword(password)).rejects.toBeInstanceOf(
      RangeError,
    );
  });

  it('does not accept a long password through bcrypt truncation', async () => {
    const password = 'a'.repeat(72);
    const hash = await hashPassword(password);

    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword(`${password}extra`, hash)).toBe(false);
  });
});

describe('Access tokens', () => {
  const identity = {
    userId: randomUUID(),
    sessionId: randomUUID(),
  };

  it('signs and verifies a token with the configured lifetime', () => {
    const token = signAccessToken(identity);

    expect(verifyAccessToken(token)).toEqual(identity);

    const payload = jwt.verify(
      token,
      getAuthConfig().accessTokenSecret,
      { algorithms: ['HS256'] },
    );

    if (typeof payload === 'string') {
      throw new Error('Expected an object JWT payload');
    }

    expect(payload.exp! - payload.iat!).toBe(900);
    expect(payload).not.toHaveProperty('role');
    expect(payload).not.toHaveProperty('passwordHash');
  });

  it.each([
    ['expired', { expiresIn: -1 }],
    ['wrong audience', { audience: 'another-api' }],
    ['wrong issuer', { issuer: 'another-issuer' }],
    ['wrong algorithm', { algorithm: 'HS384' as const }],
  ])('rejects a token with %s', (_name, overrides) => {
    const token = jwt.sign(
      {
        sid: identity.sessionId,
        type: 'access',
      },
      getAuthConfig().accessTokenSecret,
      {
        algorithm: 'HS256',
        subject: identity.userId,
        issuer: 'equipment-maintenance-api',
        audience: 'equipment-maintenance-api',
        expiresIn: 900,
        ...overrides,
      },
    );

    expect(() => verifyAccessToken(token)).toThrow(UnauthorizedError);
  });

  it('rejects a token signed with another secret', () => {
    const token = jwt.sign(
      {
        sid: identity.sessionId,
        type: 'access',
      },
      'another-test-secret-with-at-least-32-characters',
      {
        algorithm: 'HS256',
        subject: identity.userId,
        issuer: 'equipment-maintenance-api',
        audience: 'equipment-maintenance-api',
        expiresIn: 900,
      },
    );

    expect(() => verifyAccessToken(token)).toThrow(UnauthorizedError);
  });

  it('rejects a signed token without an expiration claim', () => {
    const token = jwt.sign(
      {
        sid: identity.sessionId,
        type: 'access',
      },
      getAuthConfig().accessTokenSecret,
      {
        algorithm: 'HS256',
        subject: identity.userId,
        issuer: 'equipment-maintenance-api',
        audience: 'equipment-maintenance-api',
      },
    );

    expect(() => verifyAccessToken(token)).toThrow(UnauthorizedError);
  });

  it('rejects a malformed token', () => {
    expect(() => verifyAccessToken('not-a-jwt')).toThrow(
      UnauthorizedError,
    );
  });
});

describe('Refresh tokens', () => {
  it('generates distinct tokens and stable SHA-256 hashes', () => {
    const first = generateRefreshToken();
    const second = generateRefreshToken();

    expect(first).not.toBe(second);
    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const hash = hashRefreshToken(first);

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(hashRefreshToken(first));
    expect(hash).not.toBe(hashRefreshToken(second));
  });
});