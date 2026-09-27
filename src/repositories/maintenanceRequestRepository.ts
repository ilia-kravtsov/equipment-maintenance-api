import type {
  MaintenanceRequest,
  MaintenanceRequestListQuery,
  RequestStatus,
  UpdateMaintenanceRequestInput,
} from '../models/maintenanceRequest.js';
import type { PaginatedResult } from '../models/pagination.js';
import type { RequestStatusHistory } from '../models/requestStatusHistory.js';

export interface MaintenanceRequestRepository {
  findAll(
    query: MaintenanceRequestListQuery,
  ): Promise<PaginatedResult<MaintenanceRequest>>;

  findById(id: string): Promise<MaintenanceRequest | undefined>;

  findHistory(requestId: string): Promise<RequestStatusHistory[]>;

  findByEquipmentId(
    equipmentId: string,
  ): Promise<MaintenanceRequest[]>;

  create(request: MaintenanceRequest): Promise<MaintenanceRequest>;

  update(
    id: string,
    input: UpdateMaintenanceRequestInput,
  ): Promise<MaintenanceRequest | undefined>;

  updateStatus(
    id: string,
    status: RequestStatus,
  ): Promise<MaintenanceRequest | undefined>;

  delete(id: string): Promise<boolean>;
}