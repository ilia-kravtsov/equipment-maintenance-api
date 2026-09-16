import { randomUUID } from 'node:crypto';

import { NotFoundError } from '../errors/notFoundError.js';
import type {
  CreateMaintenanceRequestInput,
  MaintenanceRequest,
  RequestStatus,
  UpdateMaintenanceRequestInput,
  UpdateMaintenanceRequestStatusInput,
  MaintenanceRequestListQuery,
  RequestPriority,
} from '../models/maintenanceRequest.js';
import type { EquipmentRepository } from '../repositories/equipmentRepository.js';
import type { MaintenanceRequestRepository } from '../repositories/maintenanceRequestRepository.js';
import { ConflictError } from '../errors/conflictError.js';
import type { PaginatedResult } from '../models/pagination.js';

const priorityOrder: Record<RequestPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const allowedStatusTransitions: Record<RequestStatus, RequestStatus[]> = {
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

  getAll(
    query: MaintenanceRequestListQuery,
  ): PaginatedResult<MaintenanceRequest> {
    let requests = this.requestRepository.findAll();

    if (query.status !== undefined) {
      requests = requests.filter((request) => request.status === query.status);
    }

    if (query.priority !== undefined) {
      requests = requests.filter(
        (request) => request.priority === query.priority,
      );
    }

    if (query.equipmentId !== undefined) {
      requests = requests.filter(
        (request) => request.equipmentId === query.equipmentId,
      );
    }

    if (query.createdFrom !== undefined) {
      const createdFrom = new Date(query.createdFrom);

      requests = requests.filter(
        (request) => new Date(request.createdAt) >= createdFrom,
      );
    }

    if (query.createdTo !== undefined) {
      const createdTo = new Date(query.createdTo);

      requests = requests.filter(
        (request) => new Date(request.createdAt) <= createdTo,
      );
    }

    if (query.sortBy !== undefined) {
      const sortBy = query.sortBy;
      const direction = query.order === 'desc' ? -1 : 1;

      requests = [...requests].sort((a, b) => {
        if (sortBy === 'priority') {
          return (
            (priorityOrder[a.priority] - priorityOrder[b.priority]) * direction
          );
        }

        const first = a[sortBy] ?? '';
        const second = b[sortBy] ?? '';

        return String(first).localeCompare(String(second)) * direction;
      });
    }

    const total = requests.length;

    const start = (query.page - 1) * query.limit;
    const end = start + query.limit;

    const data = requests.slice(start, end);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
      },
    };
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

  update(id: string, input: UpdateMaintenanceRequestInput): MaintenanceRequest {
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

    const allowedStatuses = allowedStatusTransitions[existingRequest.status];

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
