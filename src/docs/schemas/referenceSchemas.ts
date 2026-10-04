import type { OpenAPIV3 } from 'openapi-types';

const text = (maxLength: number): OpenAPIV3.SchemaObject => ({
  type: 'string',
  minLength: 1,
  maxLength,
  description: 'Пробелы по краям удаляются',
});

const siteProperties = {
  name: text(200),
  code: text(50),
  region: text(200),
  latitude: { type: 'number', minimum: -90, maximum: 90 },
  longitude: { type: 'number', minimum: -180, maximum: 180 },
} satisfies Record<string, OpenAPIV3.SchemaObject>;

const technicianProperties = {
  fullName: text(200),
  specialization: text(200),
  employeeNumber: text(50),
} satisfies Record<string, OpenAPIV3.SchemaObject>;

function referenceSchemasFor(
  name: string,
  properties: Record<string, OpenAPIV3.SchemaObject>,
): Record<string, OpenAPIV3.SchemaObject> {
  return {
    [name]: {
      type: 'object',
      required: ['id', ...Object.keys(properties)],
      properties: {
        id: { type: 'string', format: 'uuid' },
        ...properties,
      },
    },
    [`Create${name}Input`]: {
      type: 'object',
      additionalProperties: false,
      required: Object.keys(properties),
      properties,
    },
    [`Update${name}Input`]: {
      type: 'object',
      additionalProperties: false,
      minProperties: 1,
      properties,
    },
  };
}

export const referenceSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  ...referenceSchemasFor('Site', siteProperties),
  ...referenceSchemasFor('Technician', technicianProperties),
};