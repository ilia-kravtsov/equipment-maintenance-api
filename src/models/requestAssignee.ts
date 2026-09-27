export type RequestAssigneeRole = 'lead' | 'member';

export interface RequestAssigneeInput {
  technicianId: string;
  role: RequestAssigneeRole;
  hours: number;
}

export interface AssignRequestAssigneesInput {
  assignees: RequestAssigneeInput[];
}