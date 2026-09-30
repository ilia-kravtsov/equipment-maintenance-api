import { Transaction, type Sequelize } from 'sequelize';

import { MaintenanceRequestModel } from '../../../database/models/maintenanceRequestModel.js';
import { RequestAssigneeModel } from '../../../database/models/requestAssigneeModel.js';
import { NotFoundError } from '../../../errors/notFoundError.js';
import { ValidationError } from '../../../errors/validationError.js';
import type { RequestAssigneeInput } from '../../../models/requests/requestAssignee.js';
import { handleDatabaseError } from '../shared/handleDatabaseError.js';

export const replaceRequestAssignees = async (
  sequelize: Sequelize,
  requestId: string,
  assignees: RequestAssigneeInput[],
): Promise<void> => {
  try {
    await sequelize.transaction(
      {
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      },
      async (transaction) => {
        const request = await MaintenanceRequestModel.findByPk(requestId, {
          attributes: ['id'],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (request === null) {
          throw new NotFoundError('Maintenance request not found');
        }

        await RequestAssigneeModel.destroy({
          where: { requestId },
          transaction,
        });

        const leadCount = assignees.filter(
          (assignee) => assignee.role === 'lead',
        ).length;

        if (leadCount !== 1) {
          throw new ValidationError(
            'A request team must have exactly one lead',
            [
              {
                field: 'assignees',
                message: 'Exactly one technician must have the lead role',
              },
            ],
          );
        }

        await RequestAssigneeModel.bulkCreate(
          assignees.map((assignee) => ({
            requestId,
            technicianId: assignee.technicianId,
            role: assignee.role,
            hours: String(assignee.hours),
          })),
          {
            transaction,
            validate: true,
          },
        );
      },
    );
  } catch (error: unknown) {
    handleDatabaseError(error, {
      unique: 'A technician cannot be assigned to the same request twice',
      foreignKey: 'Maintenance request or technician not found',
    });
  }
};