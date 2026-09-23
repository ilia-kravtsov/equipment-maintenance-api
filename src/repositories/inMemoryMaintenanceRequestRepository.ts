import type { MaintenanceRequest } from '../models/maintenanceRequest.js';
import type { MaintenanceRequestRepository } from './maintenanceRequestRepository.js';

export class InMemoryMaintenanceRequestRepository implements MaintenanceRequestRepository {
  private readonly requests = new Map<string, MaintenanceRequest>();

  async findAll(): Promise<MaintenanceRequest[]> {
    return Array.from(this.requests.values());
  }

  async findById(id: string): Promise<MaintenanceRequest | undefined> {
    return this.requests.get(id);
  }

  async findByEquipmentId(
    equipmentId: string,
  ): Promise<MaintenanceRequest[]> {
    return Array.from(this.requests.values()).filter(
      (request) => request.equipmentId === equipmentId,
    );
  }

  async create(
    request: MaintenanceRequest,
  ): Promise<MaintenanceRequest> {
    this.requests.set(request.id, request);

    return request;
  }

  async update(
    id: string,
    request: MaintenanceRequest,
  ): Promise<MaintenanceRequest | undefined> {
    if (!this.requests.has(id)) {
      return undefined;
    }

    this.requests.set(id, request);

    return request;
  }

  async delete(id: string): Promise<boolean> {
    return this.requests.delete(id);
  }
}