import { QueryTypes, type Sequelize } from 'sequelize';

import type { SiteSummary } from '../../../models/reports/siteSummary.js';
import type { SiteSummaryRepository } from '../../siteSummaryRepository.js';

const siteSummarySql = `
  SELECT
    s.id AS "siteId",
    COUNT(r.id)::integer AS "totalRequests",
    json_build_object(
      'new', COUNT(r.id) FILTER (WHERE r.status = 'new'),
      'in_progress', COUNT(r.id) FILTER (WHERE r.status = 'in_progress'),
      'done', COUNT(r.id) FILTER (WHERE r.status = 'done'),
      'rejected', COUNT(r.id) FILTER (WHERE r.status = 'rejected')
    ) AS "byStatus",
    json_build_object(
      'low', COUNT(r.id) FILTER (WHERE r.priority = 'low'),
      'medium', COUNT(r.id) FILTER (WHERE r.priority = 'medium'),
      'high', COUNT(r.id) FILTER (WHERE r.priority = 'high'),
      'critical', COUNT(r.id) FILTER (WHERE r.priority = 'critical')
    ) AS "byPriority",
    (
      AVG(
        EXTRACT(EPOCH FROM (closure.closed_at - r.created_at)) / 3600.0
      ) FILTER (WHERE r.status = 'done')
    )::double precision AS "averageClosureHours"
  FROM public.sites AS s
  LEFT JOIN public.equipment AS e
    ON e.site_id = s.id
    AND e.deleted_at IS NULL
  LEFT JOIN public.maintenance_requests AS r
    ON r.equipment_id = e.id
    AND r.deleted_at IS NULL
  LEFT JOIN LATERAL (
    SELECT MAX(h.changed_at) AS closed_at
    FROM public.request_status_history AS h
    WHERE h.request_id = r.id
      AND h.new_status = 'done'
  ) AS closure ON TRUE
  WHERE s.id = $siteId
  GROUP BY s.id
`;

export class PostgresSiteSummaryRepository
  implements SiteSummaryRepository
{
  constructor(private readonly sequelize: Sequelize) {}

  async findBySiteId(
    siteId: string,
  ): Promise<SiteSummary | undefined> {
    const rows = await this.sequelize.query<SiteSummary>(
      siteSummarySql,
      {
        bind: { siteId },
        type: QueryTypes.SELECT,
      },
    );

    return rows[0];
  }
}