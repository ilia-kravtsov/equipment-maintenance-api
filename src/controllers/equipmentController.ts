import type { Request, Response } from 'express';

import type {
  CreateEquipmentInput,
  UpdateEquipmentInput,
} from '../models/equipment.js';
import type { EquipmentService } from '../services/equipmentService.js';

interface EquipmentParams {
  id: string;
}

export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  getAll = (_req: Request, res: Response): void => {
    const equipment = this.equipmentService.getAll();

    res.status(200).json({
      data: equipment,
    });
  };

  getById = (req: Request<EquipmentParams>, res: Response): void => {
    const equipment = this.equipmentService.getById(req.params.id);

    if (equipment === undefined) {
      res.status(404).json({
        error: {
          message: 'Equipment not found',
        },
      });
      return;
    }

    res.status(200).json({
      data: equipment,
    });
  };

  create = (req: Request, res: Response): void => {
    const equipment = this.equipmentService.create(
      req.body as CreateEquipmentInput,
    );

    res
      .status(201)
      .location(`/api/equipment/${equipment.id}`)
      .json({
        data: equipment,
      });
  };

  update = (req: Request<EquipmentParams>, res: Response): void => {
    const equipment = this.equipmentService.update(
      req.params.id,
      req.body as UpdateEquipmentInput,
    );

    if (equipment === undefined) {
      res.status(404).json({
        error: {
          message: 'Equipment not found',
        },
      });
      return;
    }

    res.status(200).json({
      data: equipment,
    });
  };

  delete = (req: Request<EquipmentParams>, res: Response): void => {
    const deleted = this.equipmentService.delete(req.params.id);

    if (!deleted) {
      res.status(404).json({
        error: {
          message: 'Equipment not found',
        },
      });
      return;
    }

    res.status(204).send();
  };
}