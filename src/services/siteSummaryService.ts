import { NotFoundError } from '../errors/notFoundError.js';
import type { SiteSummary } from '../models/reports/siteSummary.js';
import type { SiteSummaryRepository } from '../repositories/contracts/siteSummaryRepository.js';

export class SiteSummaryService {
  constructor(
    private readonly siteSummaryRepository: SiteSummaryRepository,
  ) {}

  async getBySiteId(siteId: string): Promise<SiteSummary> {
    const summary = await this.siteSummaryRepository.findBySiteId(siteId);

    if (summary === undefined) {
      throw new NotFoundError('Site not found');
    }

    return summary;
  }
}