import { randomUUID } from 'node:crypto';

import type {
  CreateEquipmentInput,
  Equipment,
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

  delete(id: string): boolean {
    return this.equipmentRepository.delete(id);
  }
}