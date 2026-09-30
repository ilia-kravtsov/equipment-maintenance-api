import type {
  CreateRefreshSessionInput,
  RefreshSession,
} from '../models/auth/refreshSession.js';

export interface RefreshSessionRepository {
  create(input: CreateRefreshSessionInput): Promise<RefreshSession>;

  findActiveById(id: string): Promise<RefreshSession | undefined>;

  rotate(
    currentTokenHash: string,
    nextTokenHash: string,
  ): Promise<RefreshSession | undefined>;

  revokeByTokenHash(tokenHash: string): Promise<void>;
}