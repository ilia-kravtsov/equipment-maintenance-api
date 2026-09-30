import type { Attributes } from 'sequelize';

import type { MaintenanceRequestModel } from '../../../database/models/maintenanceRequestModel.js';
import type { MaintenanceRequest } from '../../../models/requests/maintenanceRequest.js';
import { toRequestAssignee } from './requestAssigneeMapper.js';

type MaintenanceRequestWriteAttributes = Pick<
  Attributes<MaintenanceRequestModel>,
  | 'id'
  | 'equipmentId'
  | 'title'
  | 'description'
  | 'priority'
  | 'status'
  | 'plannedAt'
  | 'createdAt'
  | 'updatedAt'
>;

export const toMaintenanceRequest = (
  model: MaintenanceRequestModel,
): MaintenanceRequest => {
  return {
    id: model.id,
    equipmentId: model.equipmentId,
    title: model.title,
    priority: model.priority,
    status: model.status,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
    ...(model.description === null
      ? {}
      : { description: model.description }),
    ...(model.plannedAt === null
      ? {}
      : { plannedAt: model.plannedAt.toISOString() }),
    ...(model.assignments === undefined
      ? {}
      : {
        assignees: model.assignments.map(toRequestAssignee),
      }),
  };
};

export const toMaintenanceRequestWriteAttributes = (
  request: MaintenanceRequest,
): MaintenanceRequestWriteAttributes => {
  return {
    id: request.id,
    equipmentId: request.equipmentId,
    title: request.title,
    description: request.description ?? null,
    priority: request.priority,
    status: request.status,
    plannedAt:
      request.plannedAt === undefined
        ? null
        : new Date(request.plannedAt),
    createdAt: new Date(request.createdAt),
    updatedAt: new Date(request.updatedAt),
  };
};