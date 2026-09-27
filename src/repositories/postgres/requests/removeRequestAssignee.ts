import { Transaction, type Sequelize } from 'sequelize';

import { MaintenanceRequestModel } from '../../../database/models/maintenanceRequestModel.js';
import { RequestAssigneeModel } from '../../../database/models/requestAssigneeModel.js';
import { ConflictError } from '../../../errors/conflictError.js';
import { NotFoundError } from '../../../errors/notFoundError.js';

export const removeRequestAssignee = async (
  sequelize: Sequelize,
  requestId: string,
  technicianId: string,
): Promise<void> => {
  await sequelize.transaction(
    {
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    },
    async (transaction) => {
      const request = await MaintenanceRequestModel.findByPk(requestId, {
        attributes: ['id', 'status'],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (request === null) {
        throw new NotFoundError('Maintenance request not found');
      }

      const assignment = await RequestAssigneeModel.findOne({
        attributes: ['requestId', 'technicianId', 'role'],
        where: { requestId, technicianId },
        transaction,
      });

      if (assignment === null) {
        throw new NotFoundError('Request assignee not found');
      }

      const assigneeCount = await RequestAssigneeModel.count({
        where: { requestId },
        transaction,
      });

      if (request.status === 'in_progress' && assigneeCount === 1) {
        throw new ConflictError(
          'Cannot remove the last technician from a request in progress',
        );
      }

      if (assignment.role === 'lead' && assigneeCount > 1) {
        throw new ConflictError(
          'Cannot remove the lead while other technicians remain assigned',
        );
      }

      await assignment.destroy({ transaction });
    },
  );
};