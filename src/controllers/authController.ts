import type {
  NextFunction,
  Request,
  Response,
} from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

import { UnauthorizedError } from '../errors/unauthorizedError.js';
import type { AuthLocals } from '../middlewares/auth/requireAuth.js';
import type { AuthSessionResult } from '../models/auth.js';
import type {
  LoginInput,
  RegisterUserInput,
} from '../models/user.js';
import {
  clearRefreshCookie,
  readRefreshCookie,
  setRefreshCookie,
} from '../security/refreshCookie.js';
import type { AuthService } from '../services/authService.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (
    req: Request<ParamsDictionary, unknown, RegisterUserInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    res.set('Cache-Control', 'no-store');

    try {
      const user = await this.authService.register(req.body);

      res.status(201).json({
        data: user,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  login = async (
    req: Request<ParamsDictionary, unknown, LoginInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    res.set('Cache-Control', 'no-store');

    try {
      const result = await this.authService.login(req.body);

      this.sendSession(res, result);
    } catch (error: unknown) {
      next(error);
    }
  };

  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    res.set('Cache-Control', 'no-store');

    try {
      const result = await this.authService.refresh(
        readRefreshCookie(req),
      );

      this.sendSession(res, result);
    } catch (error: unknown) {
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    res.set('Cache-Control', 'no-store');

    try {
      await this.authService.logout(readRefreshCookie(req));

      clearRefreshCookie(res);
      res.status(204).end();
    } catch (error: unknown) {
      next(error);
    }
  };

  me = (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    res.set('Cache-Control', 'no-store');

    const locals: AuthLocals = res.locals;

    if (locals.user === undefined) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    res.status(200).json({
      data: locals.user,
    });
  };

  private sendSession(
    res: Response,
    result: AuthSessionResult,
  ): void {
    setRefreshCookie(
      res,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );

    res.status(200).json({
      data: {
        user: result.user,
        accessToken: result.accessToken,
        accessTokenExpiresIn: result.accessTokenExpiresIn,
      },
    });
  }
}