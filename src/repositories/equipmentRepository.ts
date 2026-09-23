import type { Equipment } from '../models/equipment.js';

export interface EquipmentRepository {
  findAll(): Promise<Equipment[]>;
  findById(id: string): Promise<Equipment | undefined>;
  findBySerialNumber(
    serialNumber: string,
  ): Promise<Equipment | undefined>;
  create(equipment: Equipment): Promise<Equipment>;
  update(
    id: string,
    equipment: Equipment,
  ): Promise<Equipment | undefined>;
  delete(id: string): Promise<boolean>;
}
