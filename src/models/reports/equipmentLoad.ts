export interface EquipmentLoadQuery {
  from?: string;
  to?: string;
  minRequests: number;
  limit: number;
  offset: number;
}

export interface EquipmentLoad {
  equipmentId: string;
  equipmentName: string;
  serialNumber: string;
  requestCount: number;
  closedRequestCount: number;
  totalPlannedHours: number;
  lastServiceAt: string | null;
}