import type { Equipment } from '../models/equipment.js';
import type { EquipmentRepository } from './equipmentRepository.js';

export class InMemoryEquipmentRepository implements EquipmentRepository {
  private readonly equipment = new Map<string, Equipment>();

  findAll(): Equipment[] {
    return Array.from(this.equipment.values());
  }

  findById(id: string): Equipment | undefined {
    return this.equipment.get(id);
  }

  findBySerialNumber(serialNumber: string): Equipment | undefined {
    return Array.from(this.equipment.values()).find(
      (equipment) => equipment.serialNumber === serialNumber,
    );
  }

  create(equipment: Equipment): Equipment {
    this.equipment.set(equipment.id, equipment);

    return equipment;
  }

  update(id: string, equipment: Equipment): Equipment | undefined {
    if (!this.equipment.has(id)) {
      return undefined;
    }

    this.equipment.set(id, equipment);

    return equipment;
  }

  delete(id: string): boolean {
    return this.equipment.delete(id);
  }
}
