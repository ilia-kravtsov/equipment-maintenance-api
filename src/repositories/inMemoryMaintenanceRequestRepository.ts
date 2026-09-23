import type {
  MaintenanceRequest,
  MaintenanceRequestListQuery,
  RequestPriority,
} from '../models/maintenanceRequest.js';
import type { PaginatedResult } from '../models/pagination.js';
import type { MaintenanceRequestRepository } from './maintenanceRequestRepository.js';

const priorityOrder: Record<RequestPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export class InMemoryMaintenanceRequestRepository implements MaintenanceRequestRepository {
  private readonly requests = new Map<string, MaintenanceRequest>();

  async findAll(
    query: MaintenanceRequestListQuery,
  ): Promise<PaginatedResult<MaintenanceRequest>> {
    let requests = Array.from(this.requests.values());

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

      requests.sort((a, b) => {
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

    return {
      data: requests.slice(start, start + query.limit),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
      },
    };
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