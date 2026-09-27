import type { SiteSummary } from '../models/siteSummary.js';

export interface SiteSummaryRepository {
  findBySiteId(siteId: string): Promise<SiteSummary | undefined>;
}