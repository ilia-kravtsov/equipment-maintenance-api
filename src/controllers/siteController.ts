import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

import type {
  CreateSiteInput,
  UpdateSiteInput,
} from '../models/sites/site.js';
import type { SiteService } from '../services/siteService.js';

export interface SiteParams extends ParamsDictionary {
  id: string;
}

export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const sites = await this.siteService.getAll();
      res.status(200).json({ data: sites });
    } catch (error: unknown) {
      next(error);
    }
  };

  getById = async (
    req: Request<SiteParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const site = await this.siteService.getById(req.params.id);
      res.status(200).json({ data: site });
    } catch (error: unknown) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const site = await this.siteService.create(
        req.body as CreateSiteInput,
      );

      res.status(201).location(`/api/sites/${site.id}`).json({
        data: site,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  update = async (
    req: Request<SiteParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const site = await this.siteService.update(
        req.params.id,
        req.body as UpdateSiteInput,
      );

      res.status(200).json({ data: site });
    } catch (error: unknown) {
      next(error);
    }
  };

  delete = async (
    req: Request<SiteParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.siteService.delete(req.params.id);
      res.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  };
}