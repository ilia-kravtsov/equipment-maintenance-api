import type { RequestAssigneeInput } from '../models/requests/requestAssignee.js';

export interface RequestAssigneeRepository {
  replace(
    requestId: string,
    assignees: RequestAssigneeInput[],
  ): Promise<void>;

  remove(
    requestId: string,
    technicianId: string,
  ): Promise<void>;
}