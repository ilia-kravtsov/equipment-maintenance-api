import type { OpenAPIV3 } from 'openapi-types';

const errorResponse = (
  description: string,
): OpenAPIV3.ResponseObject => ({
  description,
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/ErrorResponse',
      },
    },
  },
});

export const commonResponses: Record<string, OpenAPIV3.ResponseObject> = {
  BadRequest: errorResponse('Некорректные параметры запроса'),
  Unauthorized: errorResponse(
    'Access token отсутствует, недействителен или сессия отозвана',
  ),
  Forbidden: errorResponse(
    'Недостаточно прав для выполнения операции',
  ),
  NotFound: errorResponse('Ресурс не найден'),
  Conflict: errorResponse(
    'Операция противоречит текущему состоянию данных',
  ),
  ValidationError: errorResponse('Ошибка валидации данных'),
  TooManyRequests: errorResponse('Превышен лимит запросов'),
  InternalServerError: errorResponse('Внутренняя ошибка сервера'),
};