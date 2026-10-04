import type { RequestHandler } from 'express';

import { recordHttpRequest } from '../../monitoring/httpMetrics.js';

export const metricsRoutePrefix: RequestHandler = (req, res, next) => {
  res.locals.metricsRoutePrefix = req.baseUrl;
  next();
};

export const httpMetrics: RequestHandler = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.once('finish', () => {
    const routePath: unknown = req.route?.path;
    const prefix: string = res.locals.metricsRoutePrefix ?? '/api';

    const template = typeof routePath === 'string'
      ? routePath
      : Array.isArray(routePath)
        ? routePath.join('|')
        : '/unmatched';

    const route = template === '/' ? prefix : `${prefix}${template}`;
    const duration = Number(process.hrtime.bigint() - startedAt) / 1e9;
    const method = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
      .includes(req.method) ? req.method : 'OTHER';

    recordHttpRequest(method, route, res.statusCode, duration);
  });

  next();
};