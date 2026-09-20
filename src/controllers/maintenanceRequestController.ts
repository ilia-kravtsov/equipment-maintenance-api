import type { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

import type {
  CreateMaintenanceRequestInput,
  UpdateMaintenanceRequestInput,
  UpdateMaintenanceRequestStatusInput,
  MaintenanceRequestListQuery,
} from '../models/maintenanceRequest.js';
import type { MaintenanceRequestService } from '../services/maintenanceRequestService.js';
import { AppError } from '../errors/appError.js';
import type {
  BulkImportItemResult,
  BulkImportResult,
} from '../models/bulkImport.js';
import { createMaintenanceRequestSchema } from '../validators/maintenanceRequestValidator.js';

export interface MaintenanceRequestParams extends ParamsDictionary {
  id: string;
}

export class MaintenanceRequestController {
  constructor(private readonly requestService: MaintenanceRequestService) {}

  getAll = (_req: Request, res: Response): void => {
    const query = res.locals.validatedQuery as MaintenanceRequestListQuery;

    const result = this.requestService.getAll(query);

    res.status(200).json(result);
  };

  getById = (req: Request<MaintenanceRequestParams>, res: Response): void => {
    const request = this.requestService.getById(req.params.id);

    res.status(200).json({
      data: request,
    });
  };

  create = (req: Request, res: Response): void => {
    const request = this.requestService.create(
      req.body as CreateMaintenanceRequestInput,
    );

    res.status(201).location(`/api/requests/${request.id}`).json({
      data: request,
    });
  };

  importMany = (req: Request, res: Response): void => {
    const { requests } = req.body as { requests: unknown[] };

    const results: BulkImportItemResult[] = [];

    requests.forEach((item, index) => {
      const parsed = createMaintenanceRequestSchema.safeParse(item);

      if (!parsed.success) {
        results.push({
          index,
          status: 'failed',
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: parsed.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
        return;
      }

      try {
        const input: CreateMaintenanceRequestInput = {
          equipmentId: parsed.data.equipmentId,
          title: parsed.data.title,
          priority: parsed.data.priority,
          ...(parsed.data.description !== undefined && {
            description: parsed.data.description,
          }),
          ...(parsed.data.plannedAt !== undefined && {
            plannedAt: parsed.data.plannedAt,
          }),
        };

        const request = this.requestService.create(input);

        results.push({
          index,
          status: 'created',
          data: request,
        });
      } catch (error) {
        if (error instanceof AppError) {
          results.push({
            index,
            status: 'failed',
            error: {
              code: error.code,
              message: error.message,
            },
          });
          return;
        }

        throw error;
      }
    });

    const created = results.filter(
      (result) => result.status === 'created',
    ).length;

    const result: BulkImportResult = {
      total: results.length,
      created,
      failed: results.length - created,
      results,
    };

    res.status(result.failed === 0 ? 201 : 207).json({
      data: result,
    });
  };

  update = (req: Request<MaintenanceRequestParams>, res: Response): void => {
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

  delete = (req: Request<MaintenanceRequestParams>, res: Response): void => {
    this.requestService.delete(req.params.id);

    res.status(204).send();
  };
}
