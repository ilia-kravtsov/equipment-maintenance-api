import { Registry } from '@prometheus-io/client';

export const metricsRegistry = new Registry();

metricsRegistry.setDefaultLabels({
  service: 'equipment-maintenance-api',
});