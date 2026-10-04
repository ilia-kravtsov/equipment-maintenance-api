import {
  httpRequestDuration,
  httpRequestsTotal,
  recordHttpRequest,
} from '../../src/monitoring/httpMetrics.js';
import { metricsRegistry } from '../../src/monitoring/metrics.js';

describe('HTTP metrics', () => {
  beforeEach(() => {
    metricsRegistry.resetMetrics();
  });

  it('counts responses separately by status code', async () => {
    recordHttpRequest('GET', '/api/equipment/:id', 200, 0.02);
    recordHttpRequest('GET', '/api/equipment/:id', 200, 0.03);
    recordHttpRequest('GET', '/api/equipment/:id', 500, 0.04);

    const { values } = await httpRequestsTotal.get();

    expect(values).toEqual(expect.arrayContaining([
      expect.objectContaining({
        labels: expect.objectContaining({ status_code: '200' }),
        value: 2,
      }),
      expect.objectContaining({
        labels: expect.objectContaining({ status_code: '500' }),
        value: 1,
      }),
    ]));
  });

  it('records duration in seconds', async () => {
    recordHttpRequest('POST', '/api/requests', 201, 0.125);

    const { values } = await httpRequestDuration.get();

    expect(values).toEqual(expect.arrayContaining([
      expect.objectContaining({
        metricName: 'http_request_duration_seconds_count',
        value: 1,
      }),
      expect.objectContaining({
        metricName: 'http_request_duration_seconds_sum',
        value: 0.125,
      }),
    ]));
  });
});