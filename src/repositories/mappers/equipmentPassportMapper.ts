import type { EquipmentPassportModel } from '../../database/models/equipmentPassportModel.js';
import type { EquipmentPassport } from '../../models/equipmentPassport.js';

export const toEquipmentPassport = (
  model: EquipmentPassportModel,
): EquipmentPassport => {
  return {
    equipmentId: model.equipmentId,
    manufacturer: model.manufacturer,
    model: model.model,
    ratedPowerKw: Number(model.ratedPowerKw),
    lastVerifiedAt: model.lastVerifiedAt,
  };
};