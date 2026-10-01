import { NotFoundError } from '../errors/notFoundError.js';
import type {
  CreateTechnicianInput,
  Technician,
  UpdateTechnicianInput,
} from '../models/technicians/technician.js';
import type { TechnicianRepository } from '../repositories/contracts/technicianRepository.js';

export class TechnicianService {
  constructor(private readonly repository: TechnicianRepository) {}

  async getAll(): Promise<Technician[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Technician> {
    const technician = await this.repository.findById(id);

    if (technician === undefined) {
      throw new NotFoundError('Technician not found');
    }

    return technician;
  }

  async create(input: CreateTechnicianInput): Promise<Technician> {
    return this.repository.create(input);
  }

  async update(
    id: string,
    input: UpdateTechnicianInput,
  ): Promise<Technician> {
    const technician = await this.repository.update(id, input);

    if (technician === undefined) {
      throw new NotFoundError('Technician not found');
    }

    return technician;
  }

  async delete(id: string): Promise<void> {
    if (!await this.repository.delete(id)) {
      throw new NotFoundError('Technician not found');
    }
  }
}