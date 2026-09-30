import type { OpenAPIV3 } from 'openapi-types';

export const securitySchemes: Record<
  string,
  OpenAPIV3.SecuritySchemeObject
> = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description:
      'Access-токен из ответа login или refresh. ' +
      'В поле Authorize вводится только токен, без префикса Bearer.',
  },

  refreshCookie: {
    type: 'apiKey',
    in: 'cookie',
    name: 'refresh_token',
    description:
      'Refresh-токен в HttpOnly-cookie с Secure, SameSite=Lax ' +
      'и Path=/api/auth. Устанавливается при login и refresh.',
  },
};