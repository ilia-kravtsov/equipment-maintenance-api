import { Op } from 'sequelize';

import { RefreshSessionModel } from '../../../database/models/refreshSessionModel.js';
import type {
  CreateRefreshSessionInput,
  RefreshSession,
} from '../../../models/refreshSession.js';
import { toRefreshSession } from '../../mappers/refreshSessionMapper.js';
import type { RefreshSessionRepository } from '../../refreshSessionRepository.js';

export class PostgresRefreshSessionRepository
  implements RefreshSessionRepository
{
  async create(
    input: CreateRefreshSessionInput,
  ): Promise<RefreshSession> {
    const model = await RefreshSessionModel.create({
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: new Date(input.expiresAt),
      revokedAt: null,
    });

    return toRefreshSession(model);
  }

  async findActiveById(
    id: string,
  ): Promise<RefreshSession | undefined> {
    const model = await RefreshSessionModel.findOne({
      where: {
        id,
        revokedAt: null,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });

    return model === null ? undefined : toRefreshSession(model);
  }

  async rotate(
    currentTokenHash: string,
    nextTokenHash: string,
  ): Promise<RefreshSession | undefined> {
    if (currentTokenHash === nextTokenHash) {
      throw new Error('Refresh token rotation requires a new token hash');
    }

    const [, models] = await RefreshSessionModel.update(
      {
        tokenHash: nextTokenHash,
      },
      {
        where: {
          tokenHash: currentTokenHash,
          revokedAt: null,
          expiresAt: {
            [Op.gt]: new Date(),
          },
        },
        returning: true,
      },
    );

    const model = models[0];

    return model === undefined ? undefined : toRefreshSession(model);
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await RefreshSessionModel.update(
      {
        revokedAt: new Date(),
      },
      {
        where: {
          tokenHash,
          revokedAt: null,
        },
      },
    );
  }
}