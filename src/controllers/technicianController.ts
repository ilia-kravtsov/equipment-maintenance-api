import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

import type {
  CreateTechnicianInput,
  UpdateTechnicianInput,
} from '../models/technicians/technician.js';
import type { TechnicianService } from '../services/technicianService.js';

export interface TechnicianParams extends ParamsDictionary {
  id: string;
}

export class TechnicianController {
  constructor(private readonly service: TechnicianService) {}

  getAll = async (
    _req: Request, res: Response, next: NextFunction,
  ): Promise<void> => {
    try {
      res.status(200).json({ data: await this.service.getAll() });
    } catch (error: unknown) {
      next(error);
    }
  };

  getById = async (
    req: Request<TechnicianParams>, res: Response, next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getById(req.params.id);
      res.status(200).json({ data });
    } catch (error: unknown) {
      next(error);
    }
  };

  create = async (
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.create(
        req.body as CreateTechnicianInput,
      );
      res.status(201).location(`/api/technicians/${data.id}`).json({ data });
    } catch (error: unknown) {
      next(error);
    }
  };

  update = async (
    req: Request<TechnicianParams>, res: Response, next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.update(
        req.params.id,
        req.body as UpdateTechnicianInput,
      );
      res.status(200).json({ data });
    } catch (error: unknown) {
      next(error);
    }
  };

  delete = async (
    req: Request<TechnicianParams>, res: Response, next: NextFunction,
  ): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };
}