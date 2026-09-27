import { Transaction, type Sequelize } from 'sequelize';

import { MaintenanceRequestModel } from '../../../database/models/maintenanceRequestModel.js';
import { RequestAssigneeModel } from '../../../database/models/requestAssigneeModel.js';
import { RequestStatusHistoryModel } from '../../../database/models/requestStatusHistoryModel.js';
import { ConflictError } from '../../../errors/conflictError.js';
import type {
  MaintenanceRequest,
  RequestStatus,
} from '../../../models/maintenanceRequest.js';
import { toMaintenanceRequest } from '../../mappers/maintenanceRequestMapper.js';

const allowedTransitions: Record<RequestStatus, readonly RequestStatus[]> = {
  new: ['in_progress', 'rejected'],
  in_progress: ['done', 'rejected'],
  done: [],
  rejected: [],
};

export const updateRequestStatus = async (
  sequelize: Sequelize,
  id: string,
  status: RequestStatus,
): Promise<MaintenanceRequest | undefined> => {
  return sequelize.transaction(
    {
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    },
    async (transaction) => {
      const request = await MaintenanceRequestModel.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (request === null) {
        return undefined;
      }

      const previousStatus: RequestStatus = request.status;

      if (!allowedTransitions[previousStatus].includes(status)) {
        throw new ConflictError(
          `Cannot change request status from "${previousStatus}" to "${status}"`,
        );
      }

      if (status === 'in_progress') {
        const assignment = await RequestAssigneeModel.findOne({
          attributes: ['requestId'],
          where: { requestId: id },
          transaction,
        });

        if (assignment === null) {
          throw new ConflictError(
            'Cannot start a maintenance request without assigned technicians',
          );
        }
      }

      await request.update(
        { status },
        {
          transaction,
          returning: true,
        },
      );

      await RequestStatusHistoryModel.create(
        {
          requestId: request.id,
          previousStatus,
          newStatus: status,
          changedBy: 'api-client',
          comment: null,
          changedAt: request.updatedAt,
        },
        { transaction },
      );

      return toMaintenanceRequest(request);
    },
  );
};