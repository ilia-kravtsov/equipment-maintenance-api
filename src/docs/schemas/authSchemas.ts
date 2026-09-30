import type { OpenAPIV3 } from 'openapi-types';

const emailSchema: OpenAPIV3.SchemaObject = {
  type: 'string',
  format: 'email',
  maxLength: 254,
  example: 'user@example.com',
  description: 'Пробелы по краям удаляются, регистр приводится к нижнему',
};

const passwordSchema: OpenAPIV3.SchemaObject = {
  type: 'string',
  format: 'password',
  writeOnly: true,
  maxLength: 72,
  description: 'Не более 72 байт в UTF-8. Пробелы являются частью пароля',
};

export const authSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  RegisterUserInput: {
    type: 'object',
    additionalProperties: false,
    required: ['email', 'password'],
    properties: {
      email: emailSchema,
      password: {
        ...passwordSchema,
        minLength: 8,
      },
    },
  },

  LoginInput: {
    type: 'object',
    additionalProperties: false,
    required: ['email', 'password'],
    properties: {
      email: emailSchema,
      password: {
        ...passwordSchema,
        minLength: 1,
      },
    },
  },

  User: {
    type: 'object',
    additionalProperties: false,
    required: [
      'id',
      'email',
      'role',
      'technicianId',
      'createdAt',
      'updatedAt',
    ],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      email: {
        type: 'string',
        format: 'email',
      },
      role: {
        type: 'string',
        enum: ['viewer', 'technician', 'admin'],
      },
      technicianId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  },

  UserResponse: {
    type: 'object',
    additionalProperties: false,
    required: ['data'],
    properties: {
      data: {
        $ref: '#/components/schemas/User',
      },
    },
  },

  AuthSessionResponse: {
    type: 'object',
    additionalProperties: false,
    required: ['data'],
    properties: {
      data: {
        type: 'object',
        additionalProperties: false,
        required: [
          'user',
          'accessToken',
          'accessTokenExpiresIn',
        ],
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
          accessToken: {
            type: 'string',
            description: 'Access JWT для заголовка Authorization: Bearer.',
          },
          accessTokenExpiresIn: {
            type: 'integer',
            minimum: 60,
            maximum: 3600,
            example: 900,
            description: 'Срок действия access-токена в секундах.',
          },
        },
      },
    },
  },
};