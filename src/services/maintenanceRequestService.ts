import { randomUUID } from 'node:crypto';

import { NotFoundError } from '../errors/notFoundError.js';
import type {
  CreateMaintenanceRequestInput,
  MaintenanceRequest, RequestStatus,
  UpdateMaintenanceRequestInput, UpdateMaintenanceRequestStatusInput,
} from '../models/maintenanceRequest.js';
import type { EquipmentRepository } from '../repositories/equipmentRepository.js';
import type { MaintenanceRequestRepository } from '../repositories/maintenanceRequestRepository.js';
import {ConflictError} from "../errors/conflictError.js";

const allowedStatusTransitions: Record<
  RequestStatus,
  RequestStatus[]
> = {
  new: ['in_progress', 'rejected'],
  in_progress: ['done', 'rejected'],
  done: [],
  rejected: [],
};

export class MaintenanceRequestService {
  constructor(
    private readonly requestRepository: MaintenanceRequestRepository,
    private readonly equipmentRepository: EquipmentRepository,
  ) {}

  getAll(): MaintenanceRequest[] {
    return this.requestRepository.findAll();
  }

  getById(id: string): MaintenanceRequest {
    const request = this.requestRepository.findById(id);

    if (request === undefined) {
      throw new NotFoundError('Maintenance request not found');
    }

    return request;
  }

  getByEquipmentId(equipmentId: string): MaintenanceRequest[] {
    const equipment = this.equipmentRepository.findById(equipmentId);

    if (equipment === undefined) {
      throw new NotFoundError('Equipment not found');
    }

    return this.requestRepository.findByEquipmentId(equipmentId);
  }

  create(input: CreateMaintenanceRequestInput): MaintenanceRequest {
    const equipment = this.equipmentRepository.findById(input.equipmentId);

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

  update(
    id: string,
    input: UpdateMaintenanceRequestInput,
  ): MaintenanceRequest {
    const existingRequest = this.getById(id);

    const updatedRequest: MaintenanceRequest = {
      ...existingRequest,
      ...input,
      id: existingRequest.id,
      equipmentId: existingRequest.equipmentId,
      status: existingRequest.status,
      createdAt: existingRequest.createdAt,
      updatedAt: new Date().toISOString(),
    };

    const result = this.requestRepository.update(id, updatedRequest);

    if (result === undefined) {
      throw new NotFoundError('Maintenance request not found');
    }

    return result;
  }

  updateStatus(
    id: string,
    input: UpdateMaintenanceRequestStatusInput,
  ): MaintenanceRequest {
    const existingRequest = this.getById(id);

    const allowedStatuses =
      allowedStatusTransitions[existingRequest.status];

    if (!allowedStatuses.includes(input.status)) {
      throw new ConflictError(
        `Cannot change request status from "${existingRequest.status}" to "${input.status}"`,
      );
    }

    const updatedRequest: MaintenanceRequest = {
      ...existingRequest,
      status: input.status,
      updatedAt: new Date().toISOString(),
    };

    const result = this.requestRepository.update(id, updatedRequest);

    if (result === undefined) {
      throw new NotFoundError('Maintenance request not found');
    }

    return result;
  }

  delete(id: string): void {
    const deleted = this.requestRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError('Maintenance request not found');
    }
  }
}