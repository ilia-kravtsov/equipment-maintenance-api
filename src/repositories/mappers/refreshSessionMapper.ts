import type { RefreshSessionModel } from '../../database/models/refreshSessionModel.js';
import type { RefreshSession } from '../../models/auth/refreshSession.js';

export const toRefreshSession = (
  model: RefreshSessionModel,
): RefreshSession => {
  return {
    id: model.id,
    userId: model.userId,
    tokenHash: model.tokenHash,
    expiresAt: model.expiresAt.toISOString(),
    revokedAt: model.revokedAt?.toISOString() ?? null,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };
};