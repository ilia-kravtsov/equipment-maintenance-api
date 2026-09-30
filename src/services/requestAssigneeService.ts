import type { RequestAssigneeInput } from '../models/requests/requestAssignee.js';
import type { RequestAssigneeRepository } from '../repositories/requestAssigneeRepository.js';

export class RequestAssigneeService {
  constructor(
    private readonly requestAssigneeRepository: RequestAssigneeRepository,
  ) {}

  replace(
    requestId: string,
    assignees: RequestAssigneeInput[],
  ): Promise<void> {
    return this.requestAssigneeRepository.replace(requestId, assignees);
  }

  remove(
    requestId: string,
    technicianId: string,
  ): Promise<void> {
    return this.requestAssigneeRepository.remove(requestId, technicianId);
  }
}