import { Transaction, type Sequelize } from 'sequelize';

import { EquipmentModel } from '../../../database/models/equipmentModel.js';
import { MaintenanceRequestModel } from '../../../database/models/maintenanceRequestModel.js';
import { RequestStatusHistoryModel } from '../../../database/models/requestStatusHistoryModel.js';
import { ConflictError } from '../../../errors/conflictError.js';
import { NotFoundError } from '../../../errors/notFoundError.js';
import type { MaintenanceRequest } from '../../../models/requests/maintenanceRequest.js';
import { handleDatabaseError } from '../shared/handleDatabaseError.js';
import {
  toMaintenanceRequest,
  toMaintenanceRequestWriteAttributes,
} from '../mappers/maintenanceRequestMapper.js';

export const createRequest = async (
  sequelize: Sequelize,
  request: MaintenanceRequest,
): Promise<MaintenanceRequest> => {
  if (request.status !== 'new') {
    throw new ConflictError('A maintenance request must be created as new');
  }

  try {
    return await sequelize.transaction(
      {
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      },
      async (transaction) => {
        const equipment = await EquipmentModel.findByPk(
          request.equipmentId,
          {
            attributes: ['id', 'deletedAt'],
            paranoid: false,
            transaction,
            lock: transaction.LOCK.UPDATE,
          },
        );

        if (equipment === null || equipment.deletedAt !== null) {
          throw new NotFoundError('Equipment not found');
        }

        const model = await MaintenanceRequestModel.create(
          {
            ...toMaintenanceRequestWriteAttributes(request),
            createdBy: 'api-client',
          },
          { transaction },
        );

        await RequestStatusHistoryModel.create(
          {
            requestId: model.id,
            previousStatus: null,
            newStatus: 'new',
            changedBy: model.createdBy,
            comment: 'Заявка создана',
            changedAt: model.createdAt,
          },
          { transaction },
        );

        return toMaintenanceRequest(model);
      },
    );
  } catch (error: unknown) {
    return handleDatabaseError(error, {
      unique: 'Maintenance request already exists',
      foreignKey: 'Equipment not found',
    });
  }
};