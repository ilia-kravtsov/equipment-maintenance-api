export type RequestAssigneeRole = 'lead' | 'member';

export interface RequestAssigneeInput {
  technicianId: string;
  role: RequestAssigneeRole;
  hours: number;
}

export interface RequestAssignee extends RequestAssigneeInput {
  fullName: string;
  specialization: string;
  employeeNumber: string;
}

export interface AssignRequestAssigneesInput {
  assignees: RequestAssigneeInput[];
}