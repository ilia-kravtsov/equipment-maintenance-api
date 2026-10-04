import { Counter, Histogram } from '@prometheus-io/client';

import { metricsRegistry } from './metrics.js';

const labelNames = ['method', 'route', 'status_code'] as const;

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of completed HTTP requests',
  labelNames,
  registers: [metricsRegistry],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry],
});

export const recordHttpRequest = (
  method: string,
  route: string,
  statusCode: number,
  durationSeconds: number,
): void => {
  const labels = {
    method,
    route,
    status_code: String(statusCode),
  };

  httpRequestsTotal.inc(labels);
  httpRequestDuration.observe(labels, durationSeconds);
};