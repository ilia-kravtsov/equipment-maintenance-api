import type { MaintenanceRequest } from '../models/maintenanceRequest.js';

export interface MaintenanceRequestRepository {
  findAll(): MaintenanceRequest[];
  findById(id: string): MaintenanceRequest | undefined;
  findByEquipmentId(equipmentId: string): MaintenanceRequest[];
  create(request: MaintenanceRequest): MaintenanceRequest;
  update(
    id: string,
    request: MaintenanceRequest,
  ): MaintenanceRequest | undefined;
  delete(id: string): boolean;
}