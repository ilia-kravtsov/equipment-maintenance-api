import type {
  Equipment,
  EquipmentListQuery,
} from '../models/equipment.js';
import type { PaginatedResult } from '../models/pagination.js';
import type { EquipmentRepository } from './equipmentRepository.js';

export class InMemoryEquipmentRepository implements EquipmentRepository {
  private readonly equipment = new Map<string, Equipment>();

  async findAll(
    query: EquipmentListQuery,
  ): Promise<PaginatedResult<Equipment>> {
    let equipment = Array.from(this.equipment.values());

    if (query.status !== undefined) {
      equipment = equipment.filter((item) => item.status === query.status);
    }

    if (query.type !== undefined) {
      equipment = equipment.filter((item) => item.type === query.type);
    }

    if (query.sortBy !== undefined) {
      const sortBy = query.sortBy;
      const direction = query.order === 'desc' ? -1 : 1;

      equipment.sort((a, b) => {
        return String(a[sortBy]).localeCompare(String(b[sortBy])) * direction;
      });
    }

    const total = equipment.length;
    const start = (query.page - 1) * query.limit;

    return {
      data: equipment.slice(start, start + query.limit),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
      },
    };
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