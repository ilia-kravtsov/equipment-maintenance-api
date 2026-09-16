import type { Equipment } from '../models/equipment.js';

export interface EquipmentRepository {
  findAll(): Equipment[];
  findById(id: string): Equipment | undefined;
  findBySerialNumber(serialNumber: string): Equipment | undefined;
  create(equipment: Equipment): Equipment;
  update(id: string, equipment: Equipment): Equipment | undefined;
  delete(id: string): boolean;
}
