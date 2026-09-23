import type { Equipment } from '../models/equipment.js';
import type { EquipmentRepository } from './equipmentRepository.js';

export class InMemoryEquipmentRepository implements EquipmentRepository {
  private readonly equipment = new Map<string, Equipment>();

  async findAll(): Promise<Equipment[]> {
    return Array.from(this.equipment.values());
  }

  async findById(id: string): Promise<Equipment | undefined> {
    return this.equipment.get(id);
  }

  async findBySerialNumber(
    serialNumber: string,
  ): Promise<Equipment | undefined> {
    return Array.from(this.equipment.values()).find(
      (equipment) => equipment.serialNumber === serialNumber,
    );
  }

  async create(equipment: Equipment): Promise<Equipment> {
    this.equipment.set(equipment.id, equipment);

    return equipment;
  }

  async update(
    id: string,
    equipment: Equipment,
  ): Promise<Equipment | undefined> {
    if (!this.equipment.has(id)) {
      return undefined;
    }

    this.equipment.set(id, equipment);

    return equipment;
  }

  async delete(id: string): Promise<boolean> {
    return this.equipment.delete(id);
  }
}