import type { Attributes } from 'sequelize';

import type { EquipmentModel } from '../../database/models/equipmentModel.js';
import type { Equipment } from '../../models/equipment/equipment.js';
import { toEquipmentPassport } from './equipmentPassportMapper.js';

type EquipmentWriteAttributes = Pick<
  Attributes<EquipmentModel>,
  | 'id'
  | 'name'
  | 'type'
  | 'serialNumber'
  | 'latitude'
  | 'longitude'
  | 'status'
  | 'installedAt'
>;

export const toEquipment = (model: EquipmentModel): Equipment => {
  return {
    id: model.id,
    name: model.name,
    type: model.type,
    serialNumber: model.serialNumber,
    location: {
      lat: model.latitude,
      lon: model.longitude,
    },
    status: model.status,
    installedAt: model.installedAt,
    ...(model.passport === undefined
      ? {}
      : {
        passport:
          model.passport === null
            ? null
            : toEquipmentPassport(model.passport),
      }),
  };
};

export const toEquipmentWriteAttributes = (
  equipment: Equipment,
): EquipmentWriteAttributes => {
  return {
    id: equipment.id,
    name: equipment.name,
    type: equipment.type,
    serialNumber: equipment.serialNumber,
    latitude: equipment.location.lat,
    longitude: equipment.location.lon,
    status: equipment.status,
    installedAt: equipment.installedAt,
  };
};