import type {
  Equipment,
  EquipmentListQuery,
} from '../models/equipment.js';
import type { PaginatedResult } from '../models/pagination.js';

export interface EquipmentRepository {
  findAll(
    query: EquipmentListQuery,
  ): Promise<PaginatedResult<Equipment>>;

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