import type {
  CreateTechnicianInput,
  Technician,
  UpdateTechnicianInput,
} from '../../models/technicians/technician.js';

export interface TechnicianRepository {

  findAll(): Promise<Technician[]>;

  findById(id: string): Promise<Technician | undefined>;

  create(input: CreateTechnicianInput): Promise<Technician>;

  update(
    id: string,
    input: UpdateTechnicianInput,
  ): Promise<Technician | undefined>;

  delete(id: string): Promise<boolean>;
}