import type { OpenAPIV3 } from 'openapi-types';

export const schemaRef = (name: string): OpenAPIV3.ReferenceObject => ({
  $ref: `#/components/schemas/${name}`,
});

export const jsonBody = (name: string): OpenAPIV3.RequestBodyObject => ({
  required: true,
  content: {
    'application/json': { schema: schemaRef(name) },
  },
});

export const dataResponse = (
  description: string,
  name: string,
  list = false,
  paginated = false,
): OpenAPIV3.ResponseObject => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: paginated ? ['data', 'meta'] : ['data'],
        properties: {
          data: list
            ? { type: 'array', items: schemaRef(name) }
            : schemaRef(name),
          ...(paginated ? { meta: schemaRef('PaginationMeta') } : {}),
        },
      },
    },
  },
});

export const errorResponses = (
  ...names: string[]
): OpenAPIV3.ResponsesObject => {
  const codes: Record<string, number> = {
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    Conflict: 409,
    PayloadTooLarge: 413,
    ValidationError: 422,
    TooManyRequests: 429,
    InternalServerError: 500,
  };

  return Object.fromEntries(
    ['Unauthorized', 'TooManyRequests', 'InternalServerError', ...names]
      .map((name) => [
        codes[name],
        { $ref: `#/components/responses/${name}` },
      ]),
  );
};