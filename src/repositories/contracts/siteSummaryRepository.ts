import type { SiteSummary } from '../../models/reports/siteSummary.js';

export interface SiteSummaryRepository {
  findBySiteId(siteId: string): Promise<SiteSummary | undefined>;
}