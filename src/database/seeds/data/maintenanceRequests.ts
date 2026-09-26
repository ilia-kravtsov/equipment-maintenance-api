import { centralRequestSeeds } from './centralRequests.js';
import type { MaintenanceRequestSeed } from './maintenanceRequestSeed.js';
import { northRequestSeeds } from './northRequests.js';
import { southRequestSeeds } from './southRequests.js';

export const maintenanceRequestSeeds: MaintenanceRequestSeed[] = [
  ...northRequestSeeds,
  ...southRequestSeeds,
  ...centralRequestSeeds,
];