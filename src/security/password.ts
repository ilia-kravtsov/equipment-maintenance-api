import bcrypt from 'bcrypt';

import { getAuthConfig } from '../config/auth.js';

export const MAX_PASSWORD_BYTES = 72;

export const hashPassword = async (
  password: string,
): Promise<string> => {
  const byteLength = Buffer.byteLength(password, 'utf8');

  if (byteLength === 0 || byteLength > MAX_PASSWORD_BYTES) {
    throw new RangeError('Password must contain between 1 and 72 bytes');
  }

  return bcrypt.hash(password, getAuthConfig().bcryptRounds);
};

export const verifyPassword = async (
  password: string,
  passwordHash: string,
): Promise<boolean> => {
  const byteLength = Buffer.byteLength(password, 'utf8');

  if (byteLength === 0 || byteLength > MAX_PASSWORD_BYTES) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
};