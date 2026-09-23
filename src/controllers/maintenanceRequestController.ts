import type { NextFunction, Request, Response } from 'express';
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

  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = res.locals.validatedQuery as MaintenanceRequestListQuery;

      const result = await this.requestService.getAll(query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request<MaintenanceRequestParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const request = await this.requestService.getById(req.params.id);

      res.status(200).json({
        data: request,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const request = await this.requestService.create(
        req.body as CreateMaintenanceRequestInput,
      );

      res.status(201).location(`/api/requests/${request.id}`).json({
        data: request,
      });
    } catch (error) {
      next(error);
    }
  };

  importMany = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { requests } = req.body as { requests: unknown[] };

      const results: BulkImportItemResult[] = [];

      for (const [index, item] of requests.entries()) {
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

          continue;
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

          const request = await this.requestService.create(input);

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

            continue;
          }

          throw error;
        }
      }

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
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request<MaintenanceRequestParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const request = await this.requestService.update(
        req.params.id,
        req.body as UpdateMaintenanceRequestInput,
      );

      res.status(200).json({
        data: request,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (
    req: Request<MaintenanceRequestParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const request = await this.requestService.updateStatus(
        req.params.id,
        req.body as UpdateMaintenanceRequestStatusInput,
      );

      res.status(200).json({
        data: request,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request<MaintenanceRequestParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.requestService.delete(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
