import type { OpenAPIV3 } from 'openapi-types';
import { errorResponse } from '../responses.js';

export const authPaths: OpenAPIV3.PathsObject = {
  '/api/auth/register': {
    post: {
      tags: ['Authentication'],
      operationId: 'registerUser',
      summary: 'Register a user',
      description: 'Creates a user with the viewer role.',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RegisterUserInput',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'User registered.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserResponse',
              },
            },
          },
        },
        '409': errorResponse('CONFLICT', 'Email is already registered'),
        '422': { $ref: '#/components/responses/ValidationError' },
      },
    },
  },
  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      operationId: 'loginUser',
      summary: 'Log in',
      description:
        'Returns an access token and sets the refresh token in an HttpOnly cookie.',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/LoginInput',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'User authenticated.',
          headers: {
            'Set-Cookie': {
              description: 'Refresh token cookie.',
              schema: {
                type: 'string',
              },
            },
          },
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthSessionResponse',
              },
            },
          },
        },
        '401': errorResponse('UNAUTHORIZED', 'Invalid email or password'),
        '422': { $ref: '#/components/responses/ValidationError' },
        '429': errorResponse('RATE_LIMIT_EXCEEDED', 'Too many login attempts'),
      },
    },
  },
  '/api/auth/refresh': {
    post: {
      tags: ['Authentication'],
      operationId: 'refreshSession',
      summary: 'Refresh a session',
      description:
        'Uses the refresh token cookie to issue a new access token and rotate the refresh token.',
      security: [{ refreshCookie: [] }],
      responses: {
        '200': {
          description: 'Session refreshed.',
          headers: {
            'Set-Cookie': {
              description: 'Rotated refresh token cookie.',
              schema: {
                type: 'string',
              },
            },
          },
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthSessionResponse',
              },
            },
          },
        },
        '401': errorResponse(
          'UNAUTHORIZED',
          'Invalid or expired refresh token',
          'Refresh token отсутствует, недействителен, истёк или отозван',
        ),
      },
    },
  },
  '/api/auth/logout': {
    post: {
      tags: ['Authentication'],
      operationId: 'logoutUser',
      summary: 'Log out',
      description:
        'Revokes the session identified by the refresh token cookie and clears the cookie. Returns 204 when the cookie is missing.',
      security: [{}, { refreshCookie: [] }],
      responses: {
        '204': {
          description: 'Logout completed. No response body.',
          headers: {
            'Set-Cookie': {
              description: 'Clears the refresh token cookie.',
              schema: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
  '/api/auth/me': {
    get: {
      tags: ['Authentication'],
      operationId: 'getCurrentUser',
      summary: 'Get the current user',
      description:
        'Returns the user associated with the access token and an active session.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Current user returned.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserResponse',
              },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
};