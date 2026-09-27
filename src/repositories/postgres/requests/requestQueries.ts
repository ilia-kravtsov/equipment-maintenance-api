import { MaintenanceRequestModel } from '../../../database/models/maintenanceRequestModel.js';
import type {
  MaintenanceRequest,
  MaintenanceRequestListQuery,
} from '../../../models/maintenanceRequest.js';
import type { PaginatedResult } from '../../../models/pagination.js';
import { toMaintenanceRequest } from '../../mappers/maintenanceRequestMapper.js';
import {
  requestAttributes,
  buildRequestOrder,
  buildRequestWhere,
} from './requestQueryOptions.js';

export const findAllRequests = async (
  query: MaintenanceRequestListQuery,
): Promise<PaginatedResult<MaintenanceRequest>> => {
  const result = await MaintenanceRequestModel.findAndCountAll({
    attributes: requestAttributes,
    where: buildRequestWhere(query),
    order: buildRequestOrder(query),
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  });

  return {
    data: result.rows.map(toMaintenanceRequest),
    meta: {
      total: result.count,
      page: query.page,
      limit: query.limit,
    },
  };
};

export const findRequestById = async (
  id: string,
): Promise<MaintenanceRequest | undefined> => {
  const model = await MaintenanceRequestModel.findByPk(id, {
    attributes: requestAttributes,
  });

  return model === null ? undefined : toMaintenanceRequest(model);
};

export const findRequestsByEquipmentId = async (
  equipmentId: string,
): Promise<MaintenanceRequest[]> => {
  const models = await MaintenanceRequestModel.findAll({
    attributes: requestAttributes,
    where: { equipmentId },
    order: [['id', 'ASC']],
  });

  return models.map(toMaintenanceRequest);
};