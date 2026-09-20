import { config } from '../config/index.js';
import {
  ClientHttpError,
  InvalidJsonError,
  NetworkError,
  ServerHttpError,
  TimeoutError,
} from '../errors/httpErrors.js';

export interface FetchJsonOptions {
  timeoutMs?: number;
}

export async function fetchJson<T>(
  url: URL,
  options: FetchJsonOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? config.requestTimeoutMs;

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (response.status >= 400 && response.status < 500) {
      throw new ClientHttpError(response.status);
    }

    if (response.status >= 500) {
      throw new ServerHttpError(response.status);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new InvalidJsonError();
    }
  } catch (error) {
    if (
      error instanceof ClientHttpError ||
      error instanceof ServerHttpError ||
      error instanceof InvalidJsonError
    ) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(timeoutMs);
    }

    if (error instanceof TypeError) {
      throw new NetworkError();
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new NetworkError();
  } finally {
    clearTimeout(timeoutId);
  }
}
