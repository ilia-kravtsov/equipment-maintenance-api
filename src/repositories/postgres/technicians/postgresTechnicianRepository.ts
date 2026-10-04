import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
} from 'sequelize';

import { TechnicianModel } from '../../../database/models/technicianModel.js';
import { ConflictError } from '../../../errors/conflictError.js';
import type {
  CreateTechnicianInput,
  Technician,
  UpdateTechnicianInput,
} from '../../../models/technicians/technician.js';
import type { TechnicianRepository } from '../../contracts/technicianRepository.js';
import { toTechnician } from '../mappers/technicianMapper.js';

const handleWriteError = (error: unknown): never => {
  if (error instanceof UniqueConstraintError) {
    throw new ConflictError(
      'Technician with this employee number already exists',
    );
  }

  throw error;
};

export class PostgresTechnicianRepository implements TechnicianRepository {
  async findAll(): Promise<Technician[]> {
    const models = await TechnicianModel.findAll({
      order: [['fullName', 'ASC'], ['id', 'ASC']],
    });

    return models.map(toTechnician);
  }

  async findById(id: string): Promise<Technician | undefined> {
    const model = await TechnicianModel.findByPk(id);

    return model === null ? undefined : toTechnician(model);
  }

  async create(input: CreateTechnicianInput): Promise<Technician> {
    try {
      const model = await TechnicianModel.create({
        fullName: input.fullName,
        specialization: input.specialization,
        employeeNumber: input.employeeNumber,
      });

      return toTechnician(model);
    } catch (error: unknown) {
      return handleWriteError(error);
    }
  }

  async update(
    id: string,
    input: UpdateTechnicianInput,
  ): Promise<Technician | undefined> {
    try {
      const [, models] = await TechnicianModel.update(input, {
        where: { id },
        fields: ['fullName', 'specialization', 'employeeNumber'],
        returning: true,
      });

      const model = models[0];
      return model === undefined ? undefined : toTechnician(model);
    } catch (error: unknown) {
      return handleWriteError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      return await TechnicianModel.destroy({ where: { id } }) > 0;
    } catch (error: unknown) {
      if (error instanceof ForeignKeyConstraintError) {
        throw new ConflictError(
          'Cannot delete a technician linked to requests or users',
        );
      }

      throw error;
    }
  }
}