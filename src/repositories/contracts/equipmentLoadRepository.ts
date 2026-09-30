import type {
  EquipmentLoad,
  EquipmentLoadQuery,
} from '../../models/reports/equipmentLoad.js';

export interface EquipmentLoadRepository {
  findAll(query: EquipmentLoadQuery): Promise<EquipmentLoad[]>;
}