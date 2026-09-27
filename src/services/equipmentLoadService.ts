import type {
  EquipmentLoad,
  EquipmentLoadQuery,
} from '../models/equipmentLoad.js';
import type { EquipmentLoadRepository } from '../repositories/equipmentLoadRepository.js';

export class EquipmentLoadService {
  constructor(
    private readonly equipmentLoadRepository: EquipmentLoadRepository,
  ) {}

  getAll(query: EquipmentLoadQuery): Promise<EquipmentLoad[]> {
    return this.equipmentLoadRepository.findAll(query);
  }
}