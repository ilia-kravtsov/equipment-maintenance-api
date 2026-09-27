import type { Attributes, Order, WhereOptions } from 'sequelize';

import { EquipmentModel } from '../../../database/models/equipmentModel.js';
import type {
  Equipment,
  EquipmentListQuery,
} from '../../../models/equipment.js';
import type { PaginatedResult } from '../../../models/pagination.js';
import { toEquipment } from '../../mappers/equipmentMapper.js';

const attributes: Array<keyof Attributes<EquipmentModel>> = [
  'id',
  'name',
  'type',
  'serialNumber',
  'latitude',
  'longitude',
  'status',
  'installedAt',
];

const sortableFields = new Set([
  'name',
  'type',
  'status',
  'installedAt',
]);

export const findAllEquipment = async (
  query: EquipmentListQuery,
): Promise<PaginatedResult<Equipment>> => {
  const where: WhereOptions<Attributes<EquipmentModel>> = {};

  if (query.status !== undefined) {
    where.status = query.status;
  }

  if (query.type !== undefined) {
    where.type = query.type;
  }

  const order: Order = [];

  if (query.sortBy !== undefined && sortableFields.has(query.sortBy)) {
    order.push([query.sortBy, query.order === 'desc' ? 'DESC' : 'ASC']);
  }

  order.push(['id', 'ASC']);

  const result = await EquipmentModel.findAndCountAll({
    attributes,
    where,
    order,
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  });

  return {
    data: result.rows.map(toEquipment),
    meta: {
      total: result.count,
      page: query.page,
      limit: query.limit,
    },
  };
};

export const findEquipmentById = async (
  id: string,
): Promise<Equipment | undefined> => {
  const model = await EquipmentModel.findByPk(id, { attributes });

  return model === null ? undefined : toEquipment(model);
};

export const findEquipmentBySerialNumber = async (
  serialNumber: string,
): Promise<Equipment | undefined> => {
  const model = await EquipmentModel.findOne({
    attributes,
    where: { serialNumber },
    paranoid: false,
  });

  return model === null ? undefined : toEquipment(model);
};