import type {
  MaintenanceRequest,
  MaintenanceRequestListQuery,
} from '../models/maintenanceRequest.js';
import type { PaginatedResult } from '../models/pagination.js';

export interface MaintenanceRequestRepository {
  findAll(
    query: MaintenanceRequestListQuery,
  ): Promise<PaginatedResult<MaintenanceRequest>>;

  findById(id: string): Promise<MaintenanceRequest | undefined>;

  findByEquipmentId(
    equipmentId: string,
  ): Promise<MaintenanceRequest[]>;

  create(request: MaintenanceRequest): Promise<MaintenanceRequest>;

  update(
    id: string,
    request: MaintenanceRequest,
  ): Promise<MaintenanceRequest | undefined>;

  delete(id: string): Promise<boolean>;
}