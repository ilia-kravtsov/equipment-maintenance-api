import { Transaction, type Sequelize } from 'sequelize';

import { MaintenanceRequestModel } from '../../../database/models/maintenanceRequestModel.js';
import { RequestAssigneeModel } from '../../../database/models/requestAssigneeModel.js';
import { RequestStatusHistoryModel } from '../../../database/models/requestStatusHistoryModel.js';
import { ConflictError } from '../../../errors/conflictError.js';
import type {
  MaintenanceRequest,
  RequestStatus,
} from '../../../models/requests/maintenanceRequest.js';
import { toMaintenanceRequest } from '../mappers/maintenanceRequestMapper.js';
import { ForbiddenError } from '../../../errors/forbiddenError.js';
import type { User } from '../../../models/auth/user.js';

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
  user: User,
): Promise<MaintenanceRequest | undefined> => {

  if (user.role !== 'admin' && user.role !== 'technician') {
    throw new ForbiddenError('Insufficient permissions');
  }

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

      if (user.role === 'technician') {
        const technicianId = user.technicianId;

        if (technicianId === null) {
          throw new ForbiddenError('User is not linked to a technician');
        }

        const assignment = await RequestAssigneeModel.findOne({
          attributes: ['requestId'],
          where: {
            requestId: id,
            technicianId,
          },
          transaction,
        });

        if (assignment === null) {
          throw new ForbiddenError(
            'Only assigned technicians can change request status',
          );
        }
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
          changedBy: user.id,
          comment: null,
          changedAt: request.updatedAt,
        },
        { transaction },
      );

      return toMaintenanceRequest(request);
    },
  );
};