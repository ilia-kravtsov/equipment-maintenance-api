import cookieParser from 'cookie-parser';
import { Router, type RequestHandler } from 'express';

import type { AuthController } from '../controllers/authController.js';
import { createLoginRateLimiter } from '../middlewares/auth/loginRateLimiter.js';
import { validateBody } from '../middlewares/validation/validateBody.js';
import {
  loginSchema,
  registerUserSchema,
} from '../validators/authValidator.js';

export const createAuthRouter = (
  controller: AuthController,
  requireAuth: RequestHandler,
): Router => {
  const router = Router();

  router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  router.use(cookieParser());

  router.post(
    '/register',
    validateBody(registerUserSchema),
    controller.register,
  );

  router.post(
    '/login',
    createLoginRateLimiter(),
    validateBody(loginSchema),
    controller.login,
  );

  router.post('/refresh', controller.refresh);

  router.post('/logout', controller.logout);

  router.get('/me', requireAuth, controller.me);

  return router;
};