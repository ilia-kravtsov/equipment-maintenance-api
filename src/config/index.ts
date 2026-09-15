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

export const config = {
  get port(): number {
    return parsePort(process.env.PORT);
  },

  get nodeEnv(): string {
    return process.env.NODE_ENV ?? 'development';
  },
};