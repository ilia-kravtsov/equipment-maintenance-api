export interface Technician {
  id: string;
  fullName: string;
  specialization: string;
  employeeNumber: string;
}

export type CreateTechnicianInput = Omit<Technician, 'id'>;

export type UpdateTechnicianInput = Partial<CreateTechnicianInput>;