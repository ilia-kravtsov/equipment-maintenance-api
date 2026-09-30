import type {
  MaintenanceRequest,
  MaintenanceRequestListQuery,
  RequestStatus,
  UpdateMaintenanceRequestInput,
} from '../../models/requests/maintenanceRequest.js';
import type { PaginatedResult } from '../../models/shared/pagination.js';
import type { RequestStatusHistory } from '../../models/requests/requestStatusHistory.js';

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