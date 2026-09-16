import type { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

import type {
  CreateMaintenanceRequestInput,
  UpdateMaintenanceRequestInput, UpdateMaintenanceRequestStatusInput,
} from '../models/maintenanceRequest.js';
import type { MaintenanceRequestService } from '../services/maintenanceRequestService.js';

export interface MaintenanceRequestParams extends ParamsDictionary {
  id: string;
}

export class MaintenanceRequestController {
  constructor(
    private readonly requestService: MaintenanceRequestService,
  ) {}

  getAll = (_req: Request, res: Response): void => {
    const requests = this.requestService.getAll();

    res.status(200).json({
      data: requests,
    });
  };

  getById = (
    req: Request<MaintenanceRequestParams>,
    res: Response,
  ): void => {
    const request = this.requestService.getById(req.params.id);

    res.status(200).json({
      data: request,
    });
  };

  create = (req: Request, res: Response): void => {
    const request = this.requestService.create(
      req.body as CreateMaintenanceRequestInput,
    );

    res
      .status(201)
      .location(`/api/requests/${request.id}`)
      .json({
        data: request,
      });
  };

  update = (
    req: Request<MaintenanceRequestParams>,
    res: Response,
  ): void => {
    const request = this.requestService.update(
      req.params.id,
      req.body as UpdateMaintenanceRequestInput,
    );

    res.status(200).json({
      data: request,
    });
  };

  updateStatus = (
    req: Request<MaintenanceRequestParams>,
    res: Response,
  ): void => {
    const request = this.requestService.updateStatus(
      req.params.id,
      req.body as UpdateMaintenanceRequestStatusInput,
    );

    res.status(200).json({
      data: request,
    });
  };

  delete = (
    req: Request<MaintenanceRequestParams>,
    res: Response,
  ): void => {
    this.requestService.delete(req.params.id);

    res.status(204).send();
  };
}