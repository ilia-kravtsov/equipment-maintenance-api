import type { TechnicianModel } from '../../../database/models/technicianModel.js';
import type { Technician } from '../../../models/technicians/technician.js';

export const toTechnician = (model: TechnicianModel): Technician => ({
  id: model.id,
  fullName: model.fullName,
  specialization: model.specialization,
  employeeNumber: model.employeeNumber,
});