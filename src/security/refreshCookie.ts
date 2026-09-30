import type { CookieOptions, Request, Response } from 'express';

const refreshCookieName = 'refresh_token';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/api/auth',
};

export const readRefreshCookie = (
  req: Request,
): string | undefined => {
  const cookies: unknown = req.cookies;

  if (
    typeof cookies !== 'object' ||
    cookies === null ||
    !(refreshCookieName in cookies)
  ) {
    return undefined;
  }

  const value: unknown = cookies[refreshCookieName];

  return typeof value === 'string' ? value : undefined;
};

export const setRefreshCookie = (
  res: Response,
  token: string,
  expiresAt: string,
): void => {
  res.cookie(refreshCookieName, token, {
    ...refreshCookieOptions,
    expires: new Date(expiresAt),
  });
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(refreshCookieName, refreshCookieOptions);
};