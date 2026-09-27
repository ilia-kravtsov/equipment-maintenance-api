import type { NextFunction, Request, Response } from 'express';

import type { EquipmentLoadQuery } from '../models/equipmentLoad.js';
import type { EquipmentLoadService } from '../services/equipmentLoadService.js';

export class EquipmentLoadController {
  constructor(
    private readonly equipmentLoadService: EquipmentLoadService,
  ) {}

  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = res.locals.validatedQuery as EquipmentLoadQuery;
      const report = await this.equipmentLoadService.getAll(query);

      res.status(200).json({
        data: report,
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}