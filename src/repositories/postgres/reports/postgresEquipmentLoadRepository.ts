import { QueryTypes, type Sequelize } from 'sequelize';

import type {
  EquipmentLoad,
  EquipmentLoadQuery,
} from '../../../models/reports/equipmentLoad.js';
import type { EquipmentLoadRepository } from '../../equipmentLoadRepository.js';

interface EquipmentLoadRow {
  equipmentId: string;
  equipmentName: string;
  serialNumber: string;
  requestCount: number;
  closedRequestCount: number;
  totalPlannedHours: number;
  lastServiceAt: Date | null;
}

const equipmentLoadSql = `
  WITH selected_requests AS (
    SELECT
      r.id,
      r.equipment_id,
      r.status
    FROM public.maintenance_requests AS r
    WHERE r.deleted_at IS NULL
      AND (
        CAST($from AS timestamptz) IS NULL
        OR r.created_at >= CAST($from AS timestamptz)
      )
      AND (
        CAST($to AS timestamptz) IS NULL
        OR r.created_at <= CAST($to AS timestamptz)
      )
  )
  SELECT
    e.id AS "equipmentId",
    e.name AS "equipmentName",
    e.serial_number AS "serialNumber",
    COUNT(r.id)::integer AS "requestCount",
    (
      COUNT(r.id) FILTER (WHERE r.status = 'done')
    )::integer AS "closedRequestCount",
    COALESCE(
      SUM(labor.planned_hours),
      0
    )::double precision AS "totalPlannedHours",
    MAX(closure.closed_at) FILTER (
      WHERE r.status = 'done'
    ) AS "lastServiceAt"
  FROM public.equipment AS e
  LEFT JOIN selected_requests AS r
    ON r.equipment_id = e.id
  LEFT JOIN LATERAL (
    SELECT SUM(a.hours) AS planned_hours
    FROM public.request_assignees AS a
    WHERE a.request_id = r.id
  ) AS labor ON TRUE
  LEFT JOIN LATERAL (
    SELECT MAX(h.changed_at) AS closed_at
    FROM public.request_status_history AS h
    WHERE h.request_id = r.id
      AND h.new_status = 'done'
  ) AS closure ON TRUE
  WHERE e.deleted_at IS NULL
  GROUP BY e.id, e.name, e.serial_number
  HAVING COUNT(r.id) >= $minRequests
  ORDER BY e.id ASC
  LIMIT $limit
  OFFSET $offset
`;

export class PostgresEquipmentLoadRepository
  implements EquipmentLoadRepository
{
  constructor(private readonly sequelize: Sequelize) {}

  async findAll(query: EquipmentLoadQuery): Promise<EquipmentLoad[]> {
    const rows = await this.sequelize.query<EquipmentLoadRow>(
      equipmentLoadSql,
      {
        bind: {
          from: query.from ?? null,
          to: query.to ?? null,
          minRequests: query.minRequests,
          limit: query.limit,
          offset: query.offset,
        },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map((row) => ({
      equipmentId: row.equipmentId,
      equipmentName: row.equipmentName,
      serialNumber: row.serialNumber,
      requestCount: row.requestCount,
      closedRequestCount: row.closedRequestCount,
      totalPlannedHours: row.totalPlannedHours,
      lastServiceAt: row.lastServiceAt?.toISOString() ?? null,
    }));
  }
}