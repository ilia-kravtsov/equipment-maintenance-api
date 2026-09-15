import { randomUUID } from 'node:crypto';
import { ConflictError } from '../errors/conflictError.js';
import { NotFoundError } from '../errors/notFoundError.js';
import type {
  CreateEquipmentInput,
  Equipment,
  UpdateEquipmentInput,
} from '../models/equipment.js';
import type { EquipmentRepository } from '../repositories/equipmentRepository.js';

export class EquipmentService {
  constructor(private readonly equipmentRepository: EquipmentRepository) {}

  getAll(): Equipment[] {
    return this.equipmentRepository.findAll();
  }

  getById(id: string): Equipment {
    const equipment = this.equipmentRepository.findById(id);

    if (equipment === undefined) {
      throw new NotFoundError('Equipment not found');
    }

    return equipment;
  }

  create(input: CreateEquipmentInput): Equipment {
    const existingEquipment =
      this.equipmentRepository.findBySerialNumber(input.serialNumber);

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
    const deleted = this.equipmentRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError('Equipment not found');
    }
  }
}