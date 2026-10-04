import type { OpenAPIV3 } from 'openapi-types';

export const errorResponse = (
  code: string,
  message: string,
  description = message,
): OpenAPIV3.ResponseObject => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        error: {
          code,
          message,
          requestId: 'fcb05a92-fdc0-455b-b321-bb602cc3a95e',
          ...(code === 'VALIDATION_ERROR'
            ? {
              details: [
                { field: 'id', message: 'Invalid UUID' },
              ],
            }
            : {}),
        },
      },
    },
  },
});

export const commonResponses: Record<string, OpenAPIV3.ResponseObject> = {
  BadRequest: errorResponse(
    'BAD_REQUEST',
    'Malformed JSON body',
    'Некорректный запрос',
  ),
  Unauthorized: errorResponse(
    'UNAUTHORIZED',
    'Invalid or expired access token',
    'Access token отсутствует, недействителен или сессия отозвана',
  ),
  Forbidden: errorResponse(
    'FORBIDDEN',
    'Insufficient permissions',
    'Недостаточно прав',
  ),
  NotFound: errorResponse(
    'NOT_FOUND',
    'Maintenance request not found',
    'Ресурс не найден',
  ),
  Conflict: errorResponse(
    'CONFLICT',
    'Email is already registered',
    'Конфликт с текущим состоянием данных',
  ),
  PayloadTooLarge: errorResponse(
    'PAYLOAD_TOO_LARGE',
    'Request body exceeds the allowed size',
    'Превышен допустимый размер тела запроса',
  ),
  ValidationError: errorResponse(
    'VALIDATION_ERROR',
    'Validation failed',
    'Ошибка валидации данных',
  ),
  TooManyRequests: errorResponse(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests',
    'Превышен лимит запросов',
  ),
  InternalServerError: errorResponse(
    'INTERNAL_SERVER_ERROR',
    'Internal server error',
    'Внутренняя ошибка сервера',
  ),
};