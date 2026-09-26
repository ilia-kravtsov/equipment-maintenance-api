import { randomUUID } from 'node:crypto';

import type { RequestStatus } from '../../../models/maintenanceRequest.js';
import { maintenanceRequestSeeds } from './maintenanceRequests.js';
import { requestIds } from './requestIds.js';

interface RequestStatusHistorySeed {
  id: string;
  request_id: string;
  previous_status: RequestStatus | null;
  new_status: RequestStatus;
  changed_by: string;
  comment: string | null;
  changed_at: Date;
}

const rejectionComments: Record<string, string> = {
  [requestIds.northTurbineDuplicate]:
    'Отклонена как дубликат ранее созданной заявки на плановый осмотр',

  [requestIds.southInverterDuplicate]:
    'Отклонена как дубликат ранее созданной заявки на диагностику',

  [requestIds.centralSensorRepairRejected]:
    'Восстановление признано нецелесообразным. Датчик выведен из эксплуатации',

  [requestIds.centralSensorDuplicate]:
    'Повторное обращение: ранее принято решение отказаться от ремонта датчика',
};

const createHistorySeeds = (): RequestStatusHistorySeed[] => {
  const history: RequestStatusHistorySeed[] = [];

  for (const request of maintenanceRequestSeeds) {
    const createdAt = request.created_at.getTime();
    const updatedAt = request.updated_at.getTime();

    if (
      !Number.isFinite(createdAt) ||
      !Number.isFinite(updatedAt) ||
      updatedAt < createdAt
    ) {
      throw new Error(`Invalid seed request dates: ${request.id}`);
    }

    history.push({
      id: randomUUID(),
      request_id: request.id,
      previous_status: null,
      new_status: 'new',
      changed_by: request.created_by,
      comment: 'Заявка создана',
      changed_at: request.created_at,
    });

    if (request.status === 'new') {
      continue;
    }

    if (updatedAt === createdAt) {
      throw new Error(
        `Status change must follow seed request creation: ${request.id}`,
      );
    }

    if (request.status === 'rejected') {
      const comment = rejectionComments[request.id];

      if (comment === undefined) {
        throw new Error(`Missing rejection comment: ${request.id}`);
      }

      history.push({
        id: randomUUID(),
        request_id: request.id,
        previous_status: 'new',
        new_status: 'rejected',
        changed_by: 'api-client',
        comment,
        changed_at: request.updated_at,
      });

      continue;
    }

    const startedAt =
      request.status === 'done'
        ? new Date(createdAt + Math.floor((updatedAt - createdAt) / 2))
        : request.updated_at;

    history.push({
      id: randomUUID(),
      request_id: request.id,
      previous_status: 'new',
      new_status: 'in_progress',
      changed_by: 'api-client',
      comment: 'Работы начаты.',
      changed_at: startedAt,
    });

    if (request.status === 'done') {
      history.push({
        id: randomUUID(),
        request_id: request.id,
        previous_status: 'in_progress',
        new_status: 'done',
        changed_by: 'api-client',
        comment: 'Работы завершены',
        changed_at: request.updated_at,
      });
    }
  }

  return history;
};

export const requestStatusHistorySeeds = createHistorySeeds();