import { validateSeedEntities } from './validateSeedEntities.js';
import { validateSeedAssignments } from './validateSeedAssignments.js';
import { validateSeedHistory } from './validateSeedHistory.js';

export const validateSeedData = (): void => {
  validateSeedEntities();
  validateSeedAssignments();
  validateSeedHistory();
};