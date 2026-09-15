import { randomUUID } from 'node:crypto';

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

  getById(id: string): Equipment | undefined {
    return this.equipmentRepository.findById(id);
  }

  create(input: CreateEquipmentInput): Equipment {
    const equipment: Equipment = {
      id: randomUUID(),
      ...input,
    };

    return this.equipmentRepository.create(equipment);
  }

  update(id: string, input: UpdateEquipmentInput): Equipment | undefined {
    const existingEquipment = this.equipmentRepository.findById(id);

    if (existingEquipment === undefined) {
      return undefined;
    }

    const updatedEquipment: Equipment = {
      ...existingEquipment,
      ...input,
      id: existingEquipment.id,
    };

    return this.equipmentRepository.update(id, updatedEquipment);
  }

  delete(id: string): boolean {
    return this.equipmentRepository.delete(id);
  }
}