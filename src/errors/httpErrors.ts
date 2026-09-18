export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);

    this.name = 'HttpError';
  }
}

export class ClientHttpError extends HttpError {
  constructor(status: number) {
    super(`Ошибка клиента: HTTP ${status}`, status);

    this.name = 'ClientHttpError';
  }
}

export class ServerHttpError extends HttpError {
  constructor(status: number) {
    super(`Ошибка сервера: HTTP ${status}`, status);

    this.name = 'ServerHttpError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Не удалось выполнить сетевой запрос') {
    super(message);

    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Превышено время ожидания запроса (${timeoutMs} мс)`);

    this.name = 'TimeoutError';
  }
}

export class InvalidJsonError extends Error {
  constructor() {
    super('Сервер вернул некорректный JSON');

    this.name = 'InvalidJsonError';
  }
}
