import { randomUUID } from 'node:crypto';

import request from 'supertest';

import { app } from '../../src/app.js';

const createCredentials = () => ({
  email: `http-auth-${randomUUID()}@example.com`,
  password: 'Example-password-123',
});

const readCookieHeader = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (
        typeof item === 'string' &&
        item.startsWith('refresh_token=')
      ) {
        return item;
      }
    }
  }

  throw new Error('Expected a refresh cookie');
};

const cookiePair = (header: string): string => {
  return header.split(';')[0]!;
};

const registerAndLogin = async () => {
  const credentials = createCredentials();

  await request(app)
    .post('/api/auth/register')
    .send(credentials)
    .expect(201);

  return request(app)
    .post('/api/auth/login')
    .send(credentials)
    .expect(200);
};

describe('Authentication endpoints', () => {
  it('registers a viewer without exposing the password or its hash', async () => {
    const credentials = createCredentials();

    const response = await request(app)
      .post('/api/auth/register')
      .send(credentials)
      .expect(201);

    expect(response.body.data).toEqual({
      id: expect.any(String),
      email: credentials.email,
      role: 'viewer',
      technicianId: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('rejects duplicate registration with 409', async () => {
    const credentials = createCredentials();

    await request(app)
      .post('/api/auth/register')
      .send(credentials)
      .expect(201);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        ...credentials,
        email: credentials.email.toUpperCase(),
      })
      .expect(409);

    expect(response.body.error.code).toBe('CONFLICT');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });

  it.each([
    { role: 'admin' },
    { technicianId: '00000000-0000-4000-8000-000000000001' },
  ])('rejects privileged registration fields: %j', async (extra) => {
    await request(app)
      .post('/api/auth/register')
      .send({
        ...createCredentials(),
        ...extra,
      })
      .expect(422);
  });

  it('rejects an invalid registration password with 422', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        ...createCredentials(),
        password: 'short',
      })
      .expect(422);
  });

  it('returns identical login errors for an unknown email and a wrong password', async () => {
    const credentials = createCredentials();

    await request(app)
      .post('/api/auth/register')
      .send(credentials)
      .expect(201);

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({
        ...credentials,
        password: 'Wrong-password-123',
      })
      .expect(401);

    const unknownUser = await request(app)
      .post('/api/auth/login')
      .send(createCredentials())
      .expect(401);

    for (const response of [wrongPassword, unknownUser]) {
      expect(response.body.error).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
        requestId: expect.any(String),
      });

      expect(response.headers['set-cookie']).toBeUndefined();
    }
  });

  it('sets a secure refresh cookie and returns only public session data', async () => {
    const response = await registerAndLogin();
    const cookie = readCookieHeader(response.headers['set-cookie']);

    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Path=/api/auth');
    expect(cookie).toContain('Expires=');

    expect(response.body.data).toEqual({
      user: {
        id: expect.any(String),
        email: expect.any(String),
        role: 'viewer',
        technicianId: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      accessToken: expect.any(String),
      accessTokenExpiresIn: 900,
    });

    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('returns the current user for a valid access token', async () => {
    const login = await registerAndLogin();

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .expect(200);

    expect(response.body.data).toEqual(login.body.data.user);
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('rejects a request without an access token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('rejects an invalid access token', async () => {
    await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('rotates the refresh cookie and rejects reuse of the old token', async () => {
    const login = await registerAndLogin();
    const oldCookie = cookiePair(
      readCookieHeader(login.headers['set-cookie']),
    );

    const refreshed = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', oldCookie)
      .expect(200);

    const newCookie = cookiePair(
      readCookieHeader(refreshed.headers['set-cookie']),
    );

    expect(newCookie).not.toBe(oldCookie);
    expect(refreshed.body.data.user).toEqual(login.body.data.user);
    expect(refreshed.body.data).not.toHaveProperty('refreshToken');

    await request(app)
      .get('/api/auth/me')
      .set(
        'Authorization',
        `Bearer ${refreshed.body.data.accessToken}`,
      )
      .expect(200);

    await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', oldCookie)
      .expect(401);

    await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', newCookie)
      .expect(200);
  });

  it('rejects refresh without a cookie', async () => {
    await request(app)
      .post('/api/auth/refresh')
      .expect(401);
  });

  it('logs out, clears the cookie and invalidates the session', async () => {
    const login = await registerAndLogin();
    const cookie = cookiePair(
      readCookieHeader(login.headers['set-cookie']),
    );

    const logout = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .expect(204);

    const clearedCookie = readCookieHeader(
      logout.headers['set-cookie'],
    );

    expect(clearedCookie).toContain('refresh_token=;');
    expect(clearedCookie).toContain(
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    );
    expect(clearedCookie).toContain('Path=/api/auth');
    expect(clearedCookie).toContain('HttpOnly');
    expect(clearedCookie).toContain('Secure');
    expect(clearedCookie).toContain('SameSite=Lax');
    expect(logout.text).toBe('');

    await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .expect(401);

    await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookie)
      .expect(401);

    await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .expect(204);
  });

  it('allows logout without a cookie', async () => {
    await request(app)
      .post('/api/auth/logout')
      .expect(204);
  });
});