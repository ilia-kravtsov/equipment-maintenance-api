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

  async getAll(
    query: EquipmentListQuery,
  ): Promise<PaginatedResult<Equipment>> {
    return this.equipmentRepository.findAll(query);
  }

  async getById(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findById(id);

    if (equipment === undefined) {
      throw new NotFoundError('Equipment not found');
    }

    return equipment;
  }

  async create(input: CreateEquipmentInput): Promise<Equipment> {
    const existingEquipment =
      await this.equipmentRepository.findBySerialNumber(input.serialNumber);

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

  async update(
    id: string,
    input: UpdateEquipmentInput,
  ): Promise<Equipment> {
    const existingEquipment = await this.equipmentRepository.findById(id);

    if (existingEquipment === undefined) {
      throw new NotFoundError('Equipment not found');
    }

    if (
      input.serialNumber !== undefined &&
      input.serialNumber !== existingEquipment.serialNumber
    ) {
      const equipmentWithSameSerialNumber =
        await this.equipmentRepository.findBySerialNumber(input.serialNumber);

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

    const updatedEquipmentResult = await this.equipmentRepository.update(
      id,
      updatedEquipment,
    );

    if (updatedEquipmentResult === undefined) {
      throw new NotFoundError('Equipment not found');
    }

    return updatedEquipmentResult;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);

    const requests = await this.requestRepository.findByEquipmentId(id);

    const hasOpenRequests = requests.some(
      (request) => request.status === 'new' || request.status === 'in_progress',
    );

    if (hasOpenRequests) {
      throw new ConflictError(
        'Equipment with open maintenance requests cannot be deleted',
      );
    }

    await this.equipmentRepository.delete(id);
  }
}