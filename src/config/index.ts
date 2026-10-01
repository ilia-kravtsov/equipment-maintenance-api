const parsePort = (value: string | undefined): number => {
  if (value === undefined) {
    return 3000;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
};

const parsePositiveNumber = (
  value: string | undefined,
  fallback: number,
  name: string,
): number => {
  if (value === undefined) {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${name} must be a positive number`);
  }

  return number;
};

const parseCorsOrigins = (value: string | undefined): string[] => {
  if (value === undefined) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

export const config = {
  get port(): number {
    return parsePort(process.env.PORT);
  },

  get nodeEnv(): string {
    return process.env.NODE_ENV ?? 'development';
  },

  get weatherApiUrl(): string {
    return (
      process.env.WEATHER_API_URL ?? 'https://api.open-meteo.com/v1/forecast'
    );
  },

  get requestTimeoutMs(): number {
    return parsePositiveNumber(
      process.env.REQUEST_TIMEOUT_MS,
      5000,
      'REQUEST_TIMEOUT_MS',
    );
  },

  get weatherMaxWindSpeed(): number {
    return parsePositiveNumber(
      process.env.WEATHER_MAX_WIND_SPEED,
      15,
      'WEATHER_MAX_WIND_SPEED',
    );
  },

  get corsOrigins(): string[] {
    return parseCorsOrigins(process.env.CORS_ORIGINS);
  },

  get rateLimitWindowMs(): number {
    return parsePositiveNumber(
      process.env.RATE_LIMIT_WINDOW_MS,
      60000,
      'RATE_LIMIT_WINDOW_MS',
    );
  },

  get rateLimitMax(): number {
    return parsePositiveNumber(
      process.env.RATE_LIMIT_MAX,
      100,
      'RATE_LIMIT_MAX',
    );
  },
};
