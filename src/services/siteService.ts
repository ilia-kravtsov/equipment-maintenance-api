import { NotFoundError } from '../errors/notFoundError.js';
import type {
  CreateSiteInput,
  Site,
  UpdateSiteInput,
} from '../models/sites/site.js';
import type { SiteRepository } from '../repositories/contracts/siteRepository.js';

export class SiteService {
  constructor(private readonly siteRepository: SiteRepository) {}

  async getAll(): Promise<Site[]> {
    return this.siteRepository.findAll();
  }

  async getById(id: string): Promise<Site> {
    const site = await this.siteRepository.findById(id);

    if (site === undefined) {
      throw new NotFoundError('Site not found');
    }

    return site;
  }

  async create(input: CreateSiteInput): Promise<Site> {
    return this.siteRepository.create(input);
  }

  async update(id: string, input: UpdateSiteInput): Promise<Site> {
    const site = await this.siteRepository.update(id, input);

    if (site === undefined) {
      throw new NotFoundError('Site not found');
    }

    return site;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.siteRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError('Site not found');
    }
  }
}