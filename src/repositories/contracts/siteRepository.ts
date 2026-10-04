import type {
  CreateSiteInput,
  Site,
  UpdateSiteInput,
} from '../../models/sites/site.js';

export interface SiteRepository {
  findAll(): Promise<Site[]>;

  findById(id: string): Promise<Site | undefined>;

  create(input: CreateSiteInput): Promise<Site>;

  update(id: string, input: UpdateSiteInput): Promise<Site | undefined>;

  delete(id: string): Promise<boolean>;
}