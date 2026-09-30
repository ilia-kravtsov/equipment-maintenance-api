import type { Sequelize } from 'sequelize';

import type { RequestAssigneeInput } from '../../../models/requests/requestAssignee.js';
import type { RequestAssigneeRepository } from '../../requestAssigneeRepository.js';
import { removeRequestAssignee } from './removeRequestAssignee.js';
import { replaceRequestAssignees } from './replaceRequestAssignees.js';

export class PostgresRequestAssigneeRepository
  implements RequestAssigneeRepository
{
  constructor(private readonly sequelize: Sequelize) {}

  replace(
    requestId: string,
    assignees: RequestAssigneeInput[],
  ): Promise<void> {
    return replaceRequestAssignees(this.sequelize, requestId, assignees);
  }

  remove(
    requestId: string,
    technicianId: string,
  ): Promise<void> {
    return removeRequestAssignee(this.sequelize, requestId, technicianId);
  }
}