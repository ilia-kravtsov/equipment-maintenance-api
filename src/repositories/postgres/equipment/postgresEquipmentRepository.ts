import type { Sequelize } from 'sequelize';

import type {
  Equipment,
  EquipmentListQuery,
} from '../../../models/equipment/equipment.js';
import type { PaginatedResult } from '../../../models/shared/pagination.js';
import type { EquipmentRepository } from '../../equipmentRepository.js';
import {
  findAllEquipment,
  findEquipmentById,
  findEquipmentBySerialNumber,
} from './equipmentQueries.js';
import {
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from './equipmentCommands.js';

export class PostgresEquipmentRepository implements EquipmentRepository {
  constructor(private readonly sequelize: Sequelize) {}

  findAll(
    query: EquipmentListQuery,
  ): Promise<PaginatedResult<Equipment>> {
    return findAllEquipment(query);
  }

  findById(id: string): Promise<Equipment | undefined> {
    return findEquipmentById(id);
  }

  findBySerialNumber(
    serialNumber: string,
  ): Promise<Equipment | undefined> {
    return findEquipmentBySerialNumber(serialNumber);
  }

  create(equipment: Equipment): Promise<Equipment> {
    return createEquipment(equipment);
  }

  update(
    id: string,
    equipment: Equipment,
  ): Promise<Equipment | undefined> {
    return updateEquipment(id, equipment);
  }

  delete(id: string): Promise<boolean> {
    return deleteEquipment(this.sequelize, id);
  }
}