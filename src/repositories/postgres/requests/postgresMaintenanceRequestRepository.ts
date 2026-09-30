import type { Sequelize } from 'sequelize';

import type {
  MaintenanceRequest,
  MaintenanceRequestListQuery,
  RequestStatus,
  UpdateMaintenanceRequestInput,
} from '../../../models/requests/maintenanceRequest.js';
import type { PaginatedResult } from '../../../models/shared/pagination.js';
import type { MaintenanceRequestRepository } from '../../maintenanceRequestRepository.js';
import { createRequest } from './createRequest.js';
import { deleteRequest } from './deleteRequest.js';
import {
  findAllRequests,
  findRequestById,
  findRequestsByEquipmentId,
} from './requestQueries.js';
import { updateRequest } from './updateRequest.js';
import { updateRequestStatus } from './updateRequestStatus.js';
import type { RequestStatusHistory } from '../../../models/requests/requestStatusHistory.js';
import { findRequestHistory } from './requestHistoryQueries.js';

export class PostgresMaintenanceRequestRepository
  implements MaintenanceRequestRepository
{
  constructor(private readonly sequelize: Sequelize) {}

  findAll(
    query: MaintenanceRequestListQuery,
  ): Promise<PaginatedResult<MaintenanceRequest>> {
    return findAllRequests(query);
  }

  findById(id: string): Promise<MaintenanceRequest | undefined> {
    return findRequestById(id);
  }

  findHistory(requestId: string): Promise<RequestStatusHistory[]> {
    return findRequestHistory(requestId);
  }

  findByEquipmentId(
    equipmentId: string,
  ): Promise<MaintenanceRequest[]> {
    return findRequestsByEquipmentId(equipmentId);
  }

  create(request: MaintenanceRequest): Promise<MaintenanceRequest> {
    return createRequest(this.sequelize, request);
  }

  update(
    id: string,
    input: UpdateMaintenanceRequestInput,
  ): Promise<MaintenanceRequest | undefined> {
    return updateRequest(id, input);
  }

  updateStatus(
    id: string,
    status: RequestStatus,
  ): Promise<MaintenanceRequest | undefined> {
    return updateRequestStatus(this.sequelize, id, status);
  }

  delete(id: string): Promise<boolean> {
    return deleteRequest(id);
  }
}