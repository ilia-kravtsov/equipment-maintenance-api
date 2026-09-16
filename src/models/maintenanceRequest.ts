export const requestPriorities = ['low', 'medium', 'high', 'critical'] as const;

export type RequestPriority = (typeof requestPriorities)[number];

export const requestStatuses = [
  'new',
  'in_progress',
  'done',
  'rejected',
] as const;

export type RequestStatus = (typeof requestStatuses)[number];

export interface MaintenanceRequest {
  id: string;
  equipmentId: string;
  title: string;
  description?: string;
  priority: RequestPriority;
  status: RequestStatus;
  plannedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateMaintenanceRequestInput = Omit<
  MaintenanceRequest,
  'id' | 'status' | 'createdAt' | 'updatedAt'
>;

export type UpdateMaintenanceRequestInput = Partial<
  Omit<CreateMaintenanceRequestInput, 'equipmentId'>
>;

export interface UpdateMaintenanceRequestStatusInput {
  status: RequestStatus;
}

export interface MaintenanceRequestListQuery {
  status?: RequestStatus;
  priority?: RequestPriority;
  equipmentId?: string;
  createdFrom?: string;
  createdTo?: string;
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'plannedAt' | 'priority' | 'status';
  order?: 'asc' | 'desc';
}
