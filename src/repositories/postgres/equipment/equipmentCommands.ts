import { Op, type Sequelize } from 'sequelize';

import { EquipmentModel } from '../../../database/models/equipmentModel.js';
import { MaintenanceRequestModel } from '../../../database/models/maintenanceRequestModel.js';
import { ConflictError } from '../../../errors/conflictError.js';
import type { Equipment } from '../../../models/equipment/equipment.js';
import { handleDatabaseError } from '../../handleDatabaseError.js';
import {
  toEquipment,
  toEquipmentWriteAttributes,
} from '../../mappers/equipmentMapper.js';

export const createEquipment = async (
  equipment: Equipment,
): Promise<Equipment> => {
  try {
    const model = await EquipmentModel.create(
      toEquipmentWriteAttributes(equipment),
    );

    return toEquipment(model);
  } catch (error: unknown) {
    return handleDatabaseError(error, {
      unique:
        `Equipment with serial number "${equipment.serialNumber}" already exists`,
      foreignKey: 'Site not found',
    });
  }
};

export const updateEquipment = async (
  id: string,
  equipment: Equipment,
): Promise<Equipment | undefined> => {
  try {
    const values = toEquipmentWriteAttributes(equipment);

    const [, models] = await EquipmentModel.update(
      { ...values, id },
      {
        where: { id },
        returning: true,
      },
    );

    const model = models[0];

    return model === undefined ? undefined : toEquipment(model);
  } catch (error: unknown) {
    return handleDatabaseError(error, {
      unique:
        `Equipment with serial number "${equipment.serialNumber}" already exists`,
      foreignKey: 'Site not found',
    });
  }
};

export const deleteEquipment = async (
  sequelize: Sequelize,
  id: string,
): Promise<boolean> => {
  return sequelize.transaction(async (transaction) => {
    const equipment = await EquipmentModel.findByPk(id, {
      attributes: ['id', 'deletedAt'],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (equipment === null) {
      return false;
    }

    const openRequest = await MaintenanceRequestModel.findOne({
      attributes: ['id'],
      where: {
        equipmentId: id,
        status: { [Op.in]: ['new', 'in_progress'] },
      },
      paranoid: false,
      transaction,
    });

    if (openRequest !== null) {
      throw new ConflictError(
        'Equipment with open maintenance requests cannot be deleted',
      );
    }

    await equipment.destroy({ transaction });

    return true;
  });
};