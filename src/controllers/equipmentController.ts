import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type {
  CreateEquipmentInput,
  UpdateEquipmentInput,
  EquipmentListQuery,
} from '../models/equipment.js';
import type { EquipmentService } from '../services/equipmentService.js';
import type { MaintenanceRequestService } from '../services/maintenanceRequestService.js';
import type { WeatherService } from '../services/weatherService.js';

export interface EquipmentParams extends ParamsDictionary {
  id: string;
}

export class EquipmentController {
  constructor(
    private readonly equipmentService: EquipmentService,
    private readonly requestService: MaintenanceRequestService,
    private readonly weatherService: WeatherService,
  ) {}

  getAll = (_req: Request, res: Response): void => {
    const query = res.locals.validatedQuery as EquipmentListQuery;

    const result = this.equipmentService.getAll(query);

    res.status(200).json(result);
  };

  getRequests = (req: Request<EquipmentParams>, res: Response): void => {
    const requests = this.requestService.getByEquipmentId(req.params.id);

    res.status(200).json({
      data: requests,
    });
  };

  getById = (req: Request<EquipmentParams>, res: Response): void => {
    const equipment = this.equipmentService.getById(req.params.id);

    res.status(200).json({
      data: equipment,
    });
  };

  getWeather = async (
    req: Request<EquipmentParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const weather = await this.weatherService.getByEquipmentId(req.params.id);

      res.status(200).json({
        data: weather,
      });
    } catch (error) {
      next(error);
    }
  };

  create = (req: Request, res: Response): void => {
    const equipment = this.equipmentService.create(
      req.body as CreateEquipmentInput,
    );

    res.status(201).location(`/api/equipment/${equipment.id}`).json({
      data: equipment,
    });
  };

  update = (req: Request<EquipmentParams>, res: Response): void => {
    const equipment = this.equipmentService.update(
      req.params.id,
      req.body as UpdateEquipmentInput,
    );

    res.status(200).json({
      data: equipment,
    });
  };

  delete = (req: Request<EquipmentParams>, res: Response): void => {
    this.equipmentService.delete(req.params.id);

    res.status(204).send();
  };
}
