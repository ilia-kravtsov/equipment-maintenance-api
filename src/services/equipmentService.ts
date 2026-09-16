import { randomUUID } from 'node:crypto';
import { ConflictError } from '../errors/conflictError.js';
import { NotFoundError } from '../errors/notFoundError.js';
import type {
  CreateEquipmentInput,
  Equipment,
  UpdateEquipmentInput,
  EquipmentListQuery,
} from '../models/equipment.js';
import type { EquipmentRepository } from '../repositories/equipmentRepository.js';
import type { MaintenanceRequestRepository } from '../repositories/maintenanceRequestRepository.js';
import type { PaginatedResult } from '../models/pagination.js';

export class EquipmentService {
  constructor(
    private readonly equipmentRepository: EquipmentRepository,
    private readonly requestRepository: MaintenanceRequestRepository,
  ) {}

  getAll(query: EquipmentListQuery): PaginatedResult<Equipment> {
    let equipment = this.equipmentRepository.findAll();

    if (query.status !== undefined) {
      equipment = equipment.filter((item) => item.status === query.status);
    }

    if (query.type !== undefined) {
      equipment = equipment.filter((item) => item.type === query.type);
    }

    if (query.sortBy !== undefined) {
      const sortBy = query.sortBy;
      const direction = query.order === 'desc' ? -1 : 1;

      equipment = [...equipment].sort((a, b) => {
        return String(a[sortBy]).localeCompare(String(b[sortBy])) * direction;
      });
    }

    const total = equipment.length;

    const start = (query.page - 1) * query.limit;
    const end = start + query.limit;

    const data = equipment.slice(start, end);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
      },
    };
  }

  getById(id: string): Equipment {
    const equipment = this.equipmentRepository.findById(id);

    if (equipment === undefined) {
      throw new NotFoundError('Equipment not found');
    }

    return equipment;
  }

  create(input: CreateEquipmentInput): Equipment {
    const existingEquipment = this.equipmentRepository.findBySerialNumber(
      input.serialNumber,
    );

    if (existingEquipment !== undefined) {
      throw new ConflictError(
        `Equipment with serial number "${input.serialNumber}" already exists`,
      );
    }

    const equipment: Equipment = {
      id: randomUUID(),
      ...input,
    };

    return this.equipmentRepository.create(equipment);
  }

  update(id: string, input: UpdateEquipmentInput): Equipment {
    const existingEquipment = this.equipmentRepository.findById(id);

    if (existingEquipment === undefined) {
      throw new NotFoundError('Equipment not found');
    }

    if (
      input.serialNumber !== undefined &&
      input.serialNumber !== existingEquipment.serialNumber
    ) {
      const equipmentWithSameSerialNumber =
        this.equipmentRepository.findBySerialNumber(input.serialNumber);

      if (equipmentWithSameSerialNumber !== undefined) {
        throw new ConflictError(
          `Equipment with serial number "${input.serialNumber}" already exists`,
        );
      }
    }

    const updatedEquipment: Equipment = {
      ...existingEquipment,
      ...input,
      id: existingEquipment.id,
    };

    const updatedEquipmentResult = this.equipmentRepository.update(
      id,
      updatedEquipment,
    );

    if (updatedEquipmentResult === undefined) {
      throw new NotFoundError('Equipment not found');
    }

    return updatedEquipmentResult;
  }

  delete(id: string): void {
    this.getById(id);

    const requests = this.requestRepository.findByEquipmentId(id);

    const hasOpenRequests = requests.some(
      (request) => request.status === 'new' || request.status === 'in_progress',
    );

    if (hasOpenRequests) {
      throw new ConflictError(
        'Equipment with open maintenance requests cannot be deleted',
      );
    }

    this.equipmentRepository.delete(id);
  }
}
