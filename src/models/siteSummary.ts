import type {
  RequestPriority,
  RequestStatus,
} from './maintenanceRequest.js';

export interface SiteSummary {
  siteId: string;
  totalRequests: number;
  byStatus: Record<RequestStatus, number>;
  byPriority: Record<RequestPriority, number>;
  averageClosureHours: number | null;
}