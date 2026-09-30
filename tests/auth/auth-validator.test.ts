import {
  loginSchema,
  registerUserSchema,
} from '../../src/validators/authValidator.js';

describe('Authentication validation', () => {
  it('normalizes email without changing the password', () => {
    const result = registerUserSchema.parse({
      email: '  USER@EXAMPLE.COM  ',
      password: '  password-123  ',
    });

    expect(result).toEqual({
      email: 'user@example.com',
      password: '  password-123  ',
    });
  });

  it('rejects a short registration password', () => {
    const result = registerUserSchema.safeParse({
      email: 'user@example.com',
      password: '1234567',
    });

    expect(result.success).toBe(false);
  });

  it('does not apply registration minimum length to login', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    });

    expect(result.success).toBe(true);
  });

  it.each([
    { role: 'admin' },
    { technicianId: '00000000-0000-4000-8000-000000000001' },
  ])('rejects extra registration fields: %j', (extra) => {
    const result = registerUserSchema.safeParse({
      email: 'user@example.com',
      password: 'password-123',
      ...extra,
    });

    expect(result.success).toBe(false);
  });

  it.each([
    ['registration', registerUserSchema],
    ['login', loginSchema],
  ])('rejects passwords exceeding 72 bytes for %s', (_name, schema) => {
    const result = schema.safeParse({
      email: 'user@example.com',
      password: 'я'.repeat(37),
    });

    expect(result.success).toBe(false);
  });

  it.each([
    ['registration', registerUserSchema],
    ['login', loginSchema],
  ])('accepts a password of exactly 72 bytes for %s', (_name, schema) => {
    const result = schema.safeParse({
      email: 'user@example.com',
      password: 'я'.repeat(36),
    });

    expect(result.success).toBe(true);
  });

  it.each([
    ['registration', registerUserSchema],
    ['login', loginSchema],
  ])('rejects an invalid email for %s', (_name, schema) => {
    const result = schema.safeParse({
      email: 'invalid-email',
      password: 'password-123',
    });

    expect(result.success).toBe(false);
  });
});