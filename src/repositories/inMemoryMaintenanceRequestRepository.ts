import type { MaintenanceRequest } from '../models/maintenanceRequest.js';
import type { MaintenanceRequestRepository } from './maintenanceRequestRepository.js';

export class InMemoryMaintenanceRequestRepository implements MaintenanceRequestRepository {
  private readonly requests = new Map<string, MaintenanceRequest>();

  findAll(): MaintenanceRequest[] {
    return Array.from(this.requests.values());
  }

  findById(id: string): MaintenanceRequest | undefined {
    return this.requests.get(id);
  }

  findByEquipmentId(equipmentId: string): MaintenanceRequest[] {
    return Array.from(this.requests.values()).filter(
      (request) => request.equipmentId === equipmentId,
    );
  }

  create(request: MaintenanceRequest): MaintenanceRequest {
    this.requests.set(request.id, request);

    return request;
  }

  update(
    id: string,
    request: MaintenanceRequest,
  ): MaintenanceRequest | undefined {
    if (!this.requests.has(id)) {
      return undefined;
    }

    this.requests.set(id, request);

    return request;
  }

  delete(id: string): boolean {
    return this.requests.delete(id);
  }
}
