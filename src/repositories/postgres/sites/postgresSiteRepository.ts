import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
} from 'sequelize';

import { SiteModel } from '../../../database/models/siteModel.js';
import { ConflictError } from '../../../errors/conflictError.js';
import type {
  CreateSiteInput,
  Site,
  UpdateSiteInput,
} from '../../../models/sites/site.js';
import type { SiteRepository } from '../../contracts/siteRepository.js';
import { toSite } from '../mappers/siteMapper.js';

export class PostgresSiteRepository implements SiteRepository {
  async findAll(): Promise<Site[]> {
    const models = await SiteModel.findAll({
      order: [
        ['name', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    return models.map(toSite);
  }

  async findById(id: string): Promise<Site | undefined> {
    const model = await SiteModel.findByPk(id);

    return model === null ? undefined : toSite(model);
  }

  async create(input: CreateSiteInput): Promise<Site> {
    try {
      const model = await SiteModel.create({
        name: input.name,
        code: input.code,
        region: input.region,
        latitude: input.latitude,
        longitude: input.longitude,
      });

      return toSite(model);
    } catch (error: unknown) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictError('Site with this code already exists');
      }

      throw error;
    }
  }

  async update(
    id: string,
    input: UpdateSiteInput,
  ): Promise<Site | undefined> {
    try {
      const [, models] = await SiteModel.update(input, {
        where: { id },
        fields: ['name', 'code', 'region', 'latitude', 'longitude'],
        returning: true,
      });

      const model = models[0];

      return model === undefined ? undefined : toSite(model);
    } catch (error: unknown) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictError('Site with this code already exists');
      }

      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const deletedCount = await SiteModel.destroy({
        where: { id },
      });

      return deletedCount > 0;
    } catch (error: unknown) {
      if (error instanceof ForeignKeyConstraintError) {
        throw new ConflictError(
          'Cannot delete a site linked to equipment',
        );
      }

      throw error;
    }
  }
}