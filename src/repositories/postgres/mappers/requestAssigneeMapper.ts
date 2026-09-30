import type { RequestAssigneeModel } from '../../../database/models/requestAssigneeModel.js';
import type { RequestAssignee } from '../../../models/requests/requestAssignee.js';

export const toRequestAssignee = (
  model: RequestAssigneeModel,
): RequestAssignee => {
  const technician = model.technician;

  if (technician === undefined) {
    throw new Error('Technician association must be loaded');
  }

  return {
    technicianId: model.technicianId,
    role: model.role,
    hours: Number(model.hours),
    fullName: technician.fullName,
    specialization: technician.specialization,
    employeeNumber: technician.employeeNumber,
  };
};