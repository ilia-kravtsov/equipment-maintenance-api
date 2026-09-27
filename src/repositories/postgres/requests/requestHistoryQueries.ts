import { RequestStatusHistoryModel } from '../../../database/models/requestStatusHistoryModel.js';
import type { RequestStatusHistory } from '../../../models/requestStatusHistory.js';

export const findRequestHistory = async (
  requestId: string,
): Promise<RequestStatusHistory[]> => {
  const records = await RequestStatusHistoryModel.findAll({
    attributes: [
      'id',
      'requestId',
      'previousStatus',
      'newStatus',
      'changedBy',
      'comment',
      'changedAt',
    ],
    where: { requestId },
    order: [
      ['changedAt', 'ASC'],
      ['id', 'ASC'],
    ],
  });

  return records.map((record) => ({
    id: record.id,
    requestId: record.requestId,
    previousStatus: record.previousStatus,
    newStatus: record.newStatus,
    changedBy: record.changedBy,
    comment: record.comment,
    changedAt: record.changedAt.toISOString(),
  }));
};