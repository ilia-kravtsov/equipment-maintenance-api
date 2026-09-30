import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

import type { RequestAssigneeInput } from '../models/requests/requestAssignee.js';
import type { RequestAssigneeService } from '../services/requestAssigneeService.js';

export interface RequestAssigneeParams extends ParamsDictionary {
  id: string;
}

export interface RemoveRequestAssigneeParams extends RequestAssigneeParams {
  userId: string;
}

interface ReplaceRequestAssigneesBody {
  assignees: RequestAssigneeInput[];
}

export class RequestAssigneeController {
  constructor(
    private readonly requestAssigneeService: RequestAssigneeService,
  ) {}

  replace = async (
    req: Request<RequestAssigneeParams, unknown, ReplaceRequestAssigneesBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.requestAssigneeService.replace(
        req.params.id,
        req.body.assignees,
      );

      res.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };

  remove = async (
    req: Request<RemoveRequestAssigneeParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.requestAssigneeService.remove(
        req.params.id,
        req.params.userId,
      );

      res.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };
}