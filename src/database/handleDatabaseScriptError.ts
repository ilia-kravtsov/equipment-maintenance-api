import { logger } from '../config/logger.js';

export const handleDatabaseScriptError = (
  error: unknown,
  description: string,
): void => {
  const original =
    error instanceof Error && 'original' in error
      ? error.original
      : undefined;

  const databaseCode =
    typeof original === 'object' &&
    original !== null &&
    'code' in original &&
    typeof original.code === 'string'
      ? original.code
      : undefined;

  logger.error(
    {
      errorName: error instanceof Error ? error.name : 'UnknownError',
      databaseCode,
      message:
        error instanceof Error && error.constructor === Error
          ? error.message
          : undefined,
    },
    description,
  );

  process.exitCode = 1;
};