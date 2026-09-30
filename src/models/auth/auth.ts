import type { User } from './user.js';

export interface AuthSessionResult {
  user: User;
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}