import { randomUUID } from 'node:crypto';

import { NotFoundError } from '../errors/notFoundError.js';
import type {
  CreateMaintenanceRequestInput,
  MaintenanceRequest,
  UpdateMaintenanceRequestInput,
  UpdateMaintenanceRequestStatusInput,
  MaintenanceRequestListQuery,
} from '../models/maintenanceRequest.js';
import type { EquipmentRepository } from '../repositories/equipmentRepository.js';
import type { MaintenanceRequestRepository } from '../repositories/maintenanceRequestRepository.js';
import type { PaginatedResult } from '../models/pagination.js';

export class MaintenanceRequestService {
  constructor(
    private readonly requestRepository: MaintenanceRequestRepository,
    private readonly equipmentRepository: EquipmentRepository,
  ) {}

  async getAll(
    query: MaintenanceRequestListQuery,
  ): Promise<PaginatedResult<MaintenanceRequest>> {
    return this.requestRepository.findAll(query);
  }

  async getById(id: string): Promise<MaintenanceRequest> {
    const request = await this.requestRepository.findById(id);

    if (request === undefined) {
      throw new NotFoundError('Maintenance request not found');
    }

    return request;
  }

  async getByEquipmentId(
    equipmentId: string,
  ): Promise<MaintenanceRequest[]> {
    const equipment = await this.equipmentRepository.findById(equipmentId);

    if (equipment === undefined) {
      throw new NotFoundError('Equipment not found');
    }

    return this.requestRepository.findByEquipmentId(equipmentId);
  }

  async create(
    input: CreateMaintenanceRequestInput,
  ): Promise<MaintenanceRequest> {
    const equipment = await this.equipmentRepository.findById(
      input.equipmentId,
    );

    if (equipment === undefined) {
      throw new NotFoundError('Equipment not found');
    }

    const now = new Date().toISOString();

    const request: MaintenanceRequest = {
      id: randomUUID(),
      ...input,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };

    return this.requestRepository.create(request);
  }

  async update(
    id: string,
    input: UpdateMaintenanceRequestInput,
  ): Promise<MaintenanceRequest> {
    const request = await this.requestRepository.update(id, input);

    if (request === undefined) {
      throw new NotFoundError('Maintenance request not found');
    }

    return request;
  }

  async updateStatus(
    id: string,
    input: UpdateMaintenanceRequestStatusInput,
  ): Promise<MaintenanceRequest> {
    const request = await this.requestRepository.updateStatus(
      id,
      input.status,
    );

    if (request === undefined) {
      throw new NotFoundError('Maintenance request not found');
    }

    return request;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.requestRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError('Maintenance request not found');
    }
  }
}