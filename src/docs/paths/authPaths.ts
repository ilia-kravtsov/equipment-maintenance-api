import type { OpenAPIV3 } from 'openapi-types';

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
        '409': {
          description: 'Email is already registered.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '422': {
          description: 'Request validation failed.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
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
        '401': {
          description: 'Invalid email or password.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '422': {
          description: 'Request validation failed.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '429': {
          description: 'Too many login attempts.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
};