import type { RequestStatus } from './maintenanceRequest.js';

export interface RequestStatusHistory {
  id: string;
  requestId: string;
  previousStatus: RequestStatus | null;
  newStatus: RequestStatus;
  changedBy: string;
  comment: string | null;
  changedAt: string;
}