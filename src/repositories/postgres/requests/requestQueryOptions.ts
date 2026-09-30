import {
  literal,
  Op,
  type Attributes,
  type Order,
  type WhereOptions,
} from 'sequelize';

import type {MaintenanceRequestModel} from '../../../database/models/maintenanceRequestModel.js';
import type {MaintenanceRequestListQuery} from '../../../models/requests/maintenanceRequest.js';

export const requestAttributes: Array<keyof Attributes<MaintenanceRequestModel>> = [
  'id',
  'equipmentId',
  'title',
  'description',
  'priority',
  'status',
  'plannedAt',
  'createdAt',
  'updatedAt',
];

const sortableFields = new Set([
  'createdAt',
  'updatedAt',
  'plannedAt',
  'priority',
  'status',
]);

export const buildRequestOrder = (
  query: MaintenanceRequestListQuery,
): Order => {
  const order: Order = [];
  const direction = query.order === 'desc' ? 'DESC' : 'ASC';

  if (query.sortBy !== undefined && sortableFields.has(query.sortBy)) {
    if (query.sortBy === 'priority') {
      order.push([
        literal(
          `CASE "priority"
            WHEN 'low' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'high' THEN 3
            WHEN 'critical' THEN 4
          END`,
        ),
        direction,
      ]);
    } else if (query.sortBy === 'plannedAt') {
      order.push([
        'plannedAt',
        direction === 'ASC' ? 'ASC NULLS FIRST' : 'DESC NULLS LAST',
      ]);
    } else {
      order.push([query.sortBy, direction]);
    }
  }

  order.push(['id', 'ASC']);

  return order;
};

export const buildRequestWhere = (
  query: MaintenanceRequestListQuery,
): WhereOptions<Attributes<MaintenanceRequestModel>> => {
  const where: WhereOptions<Attributes<MaintenanceRequestModel>> = {};

  if (query.status !== undefined) {
    where.status = query.status;
  }

  if (query.priority !== undefined) {
    where.priority = query.priority;
  }

  if (query.equipmentId !== undefined) {
    where.equipmentId = query.equipmentId;
  }

  if (query.createdFrom !== undefined || query.createdTo !== undefined) {
    where.createdAt = {
      ...(query.createdFrom === undefined
        ? {}
        : {[Op.gte]: new Date(query.createdFrom)}),
      ...(query.createdTo === undefined
        ? {}
        : {[Op.lte]: new Date(query.createdTo)}),
    };
  }

  return where;
};