import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { getAuthConfig } from '../config/auth.js';
import { UnauthorizedError } from '../errors/unauthorizedError.js';

const issuer = 'equipment-maintenance-api';
const audience = 'equipment-maintenance-api';

const accessTokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  sid: z.string().uuid(),
  type: z.literal('access'),
  iat: z.number().int().nonnegative(),
  exp: z.number().int().positive(),
});

export interface AccessTokenIdentity {
  userId: string;
  sessionId: string;
}

export const signAccessToken = (
  identity: AccessTokenIdentity,
): string => {
  const config = getAuthConfig();

  return jwt.sign(
    {
      sid: identity.sessionId,
      type: 'access',
    },
    config.accessTokenSecret,
    {
      algorithm: 'HS256',
      subject: identity.userId,
      issuer,
      audience,
      expiresIn: config.accessTokenTtlSeconds,
    },
  );
};

export const verifyAccessToken = (
  token: string,
): AccessTokenIdentity => {
  const config = getAuthConfig();

  try {
    const decoded = jwt.verify(token, config.accessTokenSecret, {
      algorithms: ['HS256'],
      issuer,
      audience,
    });

    const payload = accessTokenPayloadSchema.parse(decoded);

    return {
      userId: payload.sub,
      sessionId: payload.sid,
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
};