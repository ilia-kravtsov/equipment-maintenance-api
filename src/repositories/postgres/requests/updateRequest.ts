import type { Attributes } from 'sequelize';

import { MaintenanceRequestModel } from '../../../database/models/maintenanceRequestModel.js';
import type {
  MaintenanceRequest,
  UpdateMaintenanceRequestInput,
} from '../../../models/maintenanceRequest.js';
import { toMaintenanceRequest } from '../../mappers/maintenanceRequestMapper.js';

type RequestUpdateAttributes = Partial<
  Pick<
    Attributes<MaintenanceRequestModel>,
    'title' | 'description' | 'priority' | 'plannedAt'
  >
> & {
  updatedAt: Date;
};

export const updateRequest = async (
  id: string,
  input: UpdateMaintenanceRequestInput,
): Promise<MaintenanceRequest | undefined> => {
  const values: RequestUpdateAttributes = {
    updatedAt: new Date(),
  };

  if (input.title !== undefined) {
    values.title = input.title;
  }

  if (input.description !== undefined) {
    values.description = input.description;
  }

  if (input.priority !== undefined) {
    values.priority = input.priority;
  }

  if (input.plannedAt !== undefined) {
    values.plannedAt = new Date(input.plannedAt);
  }

  const [, updatedRequests] = await MaintenanceRequestModel.update(
    values,
    {
      where: { id },
      returning: true,
    },
  );

  const request = updatedRequests[0];

  return request === undefined
    ? undefined
    : toMaintenanceRequest(request);
};