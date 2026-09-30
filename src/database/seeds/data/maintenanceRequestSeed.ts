import type {
  RequestPriority,
  RequestStatus,
} from '../../../models/requests/maintenanceRequest.js';

export interface MaintenanceRequestSeed {
  id: string;
  equipment_id: string;
  title: string;
  description: string | null;
  priority: RequestPriority;
  status: RequestStatus;
  planned_at: Date | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}