import type {
  EquipmentLoad,
  EquipmentLoadQuery,
} from '../models/equipmentLoad.js';

export interface EquipmentLoadRepository {
  findAll(query: EquipmentLoadQuery): Promise<EquipmentLoad[]>;
}