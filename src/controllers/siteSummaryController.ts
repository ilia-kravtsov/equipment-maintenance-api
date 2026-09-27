import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

import type { SiteSummaryService } from '../services/siteSummaryService.js';

export interface SiteSummaryParams extends ParamsDictionary {
  id: string;
}

export class SiteSummaryController {
  constructor(
    private readonly siteSummaryService: SiteSummaryService,
  ) {}

  getSummary = async (
    req: Request<SiteSummaryParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const summary = await this.siteSummaryService.getBySiteId(
        req.params.id,
      );

      res.status(200).json({
        data: summary,
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}