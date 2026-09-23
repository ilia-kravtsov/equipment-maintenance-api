import type { MaintenanceRequest } from '../models/maintenanceRequest.js';

export interface MaintenanceRequestRepository {
  findAll(): Promise<MaintenanceRequest[]>;
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