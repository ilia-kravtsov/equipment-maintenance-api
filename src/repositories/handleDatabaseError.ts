import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
} from 'sequelize';

import { ConflictError } from '../errors/conflictError.js';
import { NotFoundError } from '../errors/notFoundError.js';

interface DatabaseErrorMessages {
  unique: string;
  foreignKey: string;
}

export const handleDatabaseError = (
  error: unknown,
  messages: DatabaseErrorMessages,
): never => {
  if (error instanceof UniqueConstraintError) {
    throw new ConflictError(messages.unique);
  }

  if (error instanceof ForeignKeyConstraintError) {
    throw new NotFoundError(messages.foreignKey);
  }

  throw error;
};