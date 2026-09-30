import { getAuthConfig } from '../config/auth.js';
import { UnauthorizedError } from '../errors/unauthorizedError.js';
import type { AuthSessionResult } from '../models/auth/auth.js';
import type { RefreshSession } from '../models/auth/refreshSession.js';
import type {
  LoginInput,
  RegisterUserInput,
  User,
} from '../models/auth/user.js';
import type { RefreshSessionRepository } from '../repositories/refreshSessionRepository.js';
import type { UserRepository } from '../repositories/userRepository.js';
import {
  signAccessToken,
  verifyAccessToken,
} from '../security/accessToken.js';
import {
  hashPassword,
  verifyPassword,
} from '../security/password.js';
import {
  generateRefreshToken,
  hashRefreshToken,
} from '../security/refreshToken.js';

const refreshTokenPattern = /^[A-Za-z0-9_-]{43}$/;

export class AuthService {
  private dummyPasswordHash: Promise<string> | undefined;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: RefreshSessionRepository,
  ) {}

  async register(input: RegisterUserInput): Promise<User> {
    const passwordHash = await hashPassword(input.password);

    return this.userRepository.create({
      email: this.normalizeEmail(input.email),
      passwordHash,
    });
  }

  async login(input: LoginInput): Promise<AuthSessionResult> {
    const dummyHash = await this.getDummyPasswordHash();

    const storedUser =
      await this.userRepository.findByEmailForAuthentication(
        this.normalizeEmail(input.email),
      );

    const passwordMatches = await verifyPassword(
      input.password,
      storedUser?.passwordHash ?? dummyHash,
    );

    if (storedUser === undefined || !passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user: User = {
      id: storedUser.id,
      email: storedUser.email,
      role: storedUser.role,
      technicianId: storedUser.technicianId,
      createdAt: storedUser.createdAt,
      updatedAt: storedUser.updatedAt,
    };

    const config = getAuthConfig();
    const refreshToken = generateRefreshToken();

    const session = await this.sessionRepository.create({
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(
        Date.now() + config.refreshSessionTtlDays * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });

    return this.createSessionResult(user, session, refreshToken);
  }

  async refresh(
    refreshToken: string | undefined,
  ): Promise<AuthSessionResult> {
    if (
      refreshToken === undefined ||
      !refreshTokenPattern.test(refreshToken)
    ) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const nextRefreshToken = generateRefreshToken();

    const session = await this.sessionRepository.rotate(
      hashRefreshToken(refreshToken),
      hashRefreshToken(nextRefreshToken),
    );

    if (session === undefined) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findById(session.userId);

    if (user === undefined) {
      await this.sessionRepository.revokeByTokenHash(session.tokenHash);

      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    return this.createSessionResult(user, session, nextRefreshToken);
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (
      refreshToken === undefined ||
      !refreshTokenPattern.test(refreshToken)
    ) {
      return;
    }

    await this.sessionRepository.revokeByTokenHash(
      hashRefreshToken(refreshToken),
    );
  }

  async authenticate(accessToken: string): Promise<User> {
    const identity = verifyAccessToken(accessToken);

    const session = await this.sessionRepository.findActiveById(
      identity.sessionId,
    );

    if (
      session === undefined ||
      session.userId !== identity.userId
    ) {
      throw new UnauthorizedError('Session is no longer active');
    }

    const user = await this.userRepository.findById(identity.userId);

    if (user === undefined) {
      throw new UnauthorizedError('Session is no longer active');
    }

    return user;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private getDummyPasswordHash(): Promise<string> {
    this.dummyPasswordHash ??= hashPassword(generateRefreshToken());

    return this.dummyPasswordHash;
  }

  private createSessionResult(
    user: User,
    session: RefreshSession,
    refreshToken: string,
  ): AuthSessionResult {
    return {
      user,
      accessToken: signAccessToken({
        userId: user.id,
        sessionId: session.id,
      }),
      accessTokenExpiresIn: getAuthConfig().accessTokenTtlSeconds,
      refreshToken,
      refreshTokenExpiresAt: session.expiresAt,
    };
  }
}