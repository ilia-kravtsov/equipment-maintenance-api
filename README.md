# Equipment Maintenance API

REST API для учёта оборудования и заявок на его техническое обслуживание

Сервис ведёт учёт оборудования, контролирует жизненный цикл
заявок, поддерживает фильтрацию, сортировку, пагинацию и позволяет
получить прогноз погоды по координатам с оценкой
соответствия погодных условий для проведения наружных работ

Проект выполнен на TypeScript с разделением на слои

- routes
- controllers
- services
- repositories

## Возможности

- CRUD операции для оборудования и заявок на обслуживание
- проверка уникальности серийного номера оборудования
- фильтрация, сортировка и пагинация списков
- интеграция с Open Meteo для получения прогноза погоды по координатам
- оценка соответствия погодных условий для проведения наружных работ
- централизованная обработка ошибок
- логирование через Pino
- CORS allowlist, rate limiting, Helmet и ограничение размера JSON
- Postman коллекция с результатами позитивных и негативных сценариев запросов

## Технологии

- Node.js
- TypeScript
- Express
- Zod
- Pino
- Helmet
- CORS
- express-rate-limit
- Open-Meteo API
- dotenv
- ESLint
- Prettier
- ES modules

## Установка и запуск

Клонируйте репозиторий и установите зависимости:

``` bash
git clone https://github.com/ilia-kravtsov/equipment-maintenance-api.git
cd equipment-maintenance-api
npm install
```

Создайте локальный .env на основе .env.example:

``` bash
cp .env.example .env
```

Запуск в режиме разработки:

``` bash
npm run dev
```

По умолчанию сервер доступен по адресу:

``` text
http://localhost:3000
```

Проверка доступности:

``` http
GET /api/health
```

Ответ:

``` json
{
  "status": "ok"
}
```

## Cборка и запуск

``` bash
    npm run build
    npm start
```

`npm run build` компилирует TypeScript в `dist`

`npm start` запускает `dist/server.js`

## Переменные окружения

| Переменная | Значение по умолчанию | Назначение                                                                                         |
| --- | --- |----------------------------------------------------------------------------------------------------|
| `PORT` | `3000` | Порт HTTP сервера. Допустимое значение: целое число от 1 до 65535                                  |
| `NODE_ENV` | `development` | Режим работы приложения                                                                            |
| `WEATHER_API_URL` | `https://api.open-meteo.com/v1/forecast` | URL внешнего API для получения прогнозов погоды                                                    |
| `REQUEST_TIMEOUT_MS` | `5000` | Таймаут запроса к внешнему API в миллисекундах                                                     |
| `WEATHER_MAX_WIND_SPEED` | `15` | Максимальная скорость ветра в м/с для соответствия требованиям погодных условий для наружных работ |
| `CORS_ORIGINS` | `[]` | Список разрешённых CORS origins через запятую. По умолчанию ни один browser origin не добавлен в allowlist. |                                             |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Размер временного окна rate limiter в миллисекундах                                                |
| `RATE_LIMIT_MAX` | `100` | Максимальное количество запросов к `/api` в пределах одного окна rate limiter                      |

Пример `.env.example`:

``` dotenv
PORT=3000
NODE_ENV=development

WEATHER_API_URL=https://api.open-meteo.com/v1/forecast
REQUEST_TIMEOUT_MS=5000
WEATHER_MAX_WIND_SPEED=15
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

## Архитектура

Основной поток выполнения:

``` text
HTTP request - Middleware - Routes - Controllers - Services - Repositories
```

### Routes

Определяют HTTP маршруты и подключают переиспользуемую валидацию
`params`, `query` и `body`.

### Controllers

После получения запроса вызывают соответствующий сервис и формируют HTTP ответ

### Services

Содержат бизнес-логику:

- уникальность серийного номера
- проверку оборудования
- переходы статусов 
- интеграцию с погодным сервисом

### Repositories

Инкапсулируют доступ к данным

На данный момент используются `InMemoryEquipmentRepository` и
`InMemoryMaintenanceRequestRepository`

Поэтому данные сбрасываются после перезапуска процесса

Позднее будет возможно заменить "in memory" реализацию без изменения контроллеров
и основной бизнес-логики

### App и Server

Сборка Express приложения находится в `src/app.ts`

Запуск HTTP сервера в `src/server.ts`

## Структура проекта

``` text
src/
    api/             # HTTP клиент и клиент внешнего Weather API
    config/          # конфигурация и logger
    controllers/     # HTTP контроллеры
    errors/          # типы ошибок приложения
    middlewares/     # middleware Express
    models/          # модели и типы
    repositories/    # интерфейсы и in memory реализации
    routes/          # маршруты API
    services/        # бизнес логика
    validators/      # схемы Zod
    app.ts           # сборка Express приложения
    server.ts        # запуск сервера

docs/
    postman/         # экспортированная Postman Collection
```

## Порядок подключения middleware в app.ts

1.  Присвоение `requestId`
2.  HTTP логирование
3.  Helmet
4.  CORS
5.  Rate limiter для `/api`
6.  JSON parser с лимитом `100kb`
7.  API routes
8.  Обработчик неизвестного маршрута
9.  Обработчик ошибок JSON
10. Централизованный обработчик ошибок

## API

Базовый URL при локальном запуске:

``` text
http://localhost:3000
```

### Эндпоинты

| Метод | Путь | Назначение | Успешный код |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Проверка доступности сервиса | `200` |
| `GET` | `/api/equipment` | Список оборудования | `200` |
| `POST` | `/api/equipment` | Создание оборудования | `201` |
| `GET` | `/api/equipment/:id` | Получение оборудования | `200` |
| `PATCH` | `/api/equipment/:id` | Частичное обновление оборудования | `200` |
| `DELETE` | `/api/equipment/:id` | Удаление оборудования | `204` |
| `GET` | `/api/equipment/:id/requests` | Заявки конкретного оборудования | `200` |
| `GET` | `/api/equipment/:id/weather` | Прогноз погоды и пригодность условий для наружных работ | `200` |
| `GET` | `/api/requests` | Список заявок | `200` |
| `POST` | `/api/requests` | Создание заявки | `201` |
| `GET` | `/api/requests/:id` | Получение заявки | `200` |
| `PATCH` | `/api/requests/:id` | Частичное обновление заявки | `200` |
| `PATCH` | `/api/requests/:id/status` | Изменение статуса заявки | `200` |
| `DELETE` | `/api/requests/:id` | Удаление заявки | `204` |

При успешном `POST` сервер также возвращает заголовок `Location` с
адресом созданного ресурса

## Модель Equipment

``` ts
interface Equipment {
  id: string;
  name: string;
  type: 'turbine' | 'inverter' | 'sensor' | 'substation';
  serialNumber: string;
  location: {
    lat: number;
    lon: number;
  };
  status: 'operational' | 'maintenance' | 'fault' | 'decommissioned';
  installedAt: string;
}
```

| Поле | Правило                                                 |
| --- |---------------------------------------------------------|
| `id` | UUID, генерируется сервером                             |
| `name` | Строка от 3 до 100 символов                             |
| `type` | `turbine`, `inverter`, `sensor`, `substation`           |
| `serialNumber` | Обязательная непустая строка, уникальная в системе      |
| `location.lat` | Число от -90 до 90                                      |
| `location.lon` | Число от -180 до 180                                    |
| `status` | `operational`, `maintenance`, `fault`, `decommissioned` |
| `installedAt` | ISO дата                                                |

### Создание оборудования

``` http
POST /api/equipment
Content-Type: application/json
```

``` json
{
  "name": "Main inverter",
  "type": "inverter",
  "serialNumber": "INVERT-002",
  "location": {
    "lat": 55.7558,
    "lon": 37.6173
  },
  "status": "operational",
  "installedAt": "2025-01-15"
}
```

Пример ответа `201 Created`:

``` json
{
  "data": {
    "id": "a8bd75b4-3bf4-4a30-bb38-c088b0cf8137",
    "name": "Main inverter",
    "type": "inverter",
    "serialNumber": "INVERT-002",
    "location": {
      "lat": 55.7558,
      "lon": 37.6173
    },
    "status": "operational",
    "installedAt": "2025-01-15"
  }
}
```

Повторное создание оборудования с тем же `serialNumber` возвращает
`409 Conflict`

Удаление оборудования также возвращает `409 Conflict`, если для него
существует хотя бы одна открытая заявка со статусом `new` или
`in_progress`

## Модель Maintenance Request

``` ts
interface MaintenanceRequest {
  id: string;
  equipmentId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'in_progress' | 'done' | 'rejected';
  plannedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

Ограничения:

| Поле | Правило                                                                                 |
| --- |-----------------------------------------------------------------------------------------|
| `id` | UUID, генерируется сервером                                                             |
| `equipmentId` | UUID существующего оборудования                                                         |
| `title` | Строка от 5 до 120 символов                                                             |
| `description` | Необязательная строка до 2000 символов                                                  |
| `priority` | `low`, `medium`, `high`, `critical`                                                     |
| `status` | `new`, `in_progress`, `done`, `rejected`, при создании устанавливается сервером в `new` |
| `plannedAt` | Необязательная ISO date time                                                            |
| `createdAt` | Устанавливается сервером                                                                |
| `updatedAt` | Устанавливается сервером                                                                |

При обычном `PATCH /api/requests/:id` нельзя изменить `equipmentId`,
`status`, `id`, `createdAt` или напрямую задать `updatedAt`. 

Статус изменяется только отдельным endpoint

Неизвестные поля тела запроса отбрасываются валидатором и не попадают в модель

### Создание заявки

``` http
POST /api/requests
Content-Type: application/json
```

``` json
{
  "equipmentId": "a8bd75b4-3bf4-4a30-bb38-c088b0cf8137",
  "title": "Scheduled inverter inspection",
  "description": "Inspect the inverter before scheduled maintenance",
  "priority": "high",
  "plannedAt": "2026-10-01T10:00:00.000Z"
}
```

Пример ответа `201 Created`:

``` json
{
  "data": {
    "id": "6048638d-6910-4064-9afc-40d30ced9fd3",
    "equipmentId": "a8bd75b4-3bf4-4a30-bb38-c088b0cf8137",
    "title": "Scheduled inverter inspection",
    "description": "Inspect the inverter before scheduled maintenance.",
    "priority": "high",
    "plannedAt": "2026-10-01T10:00:00.000Z",
    "status": "new",
    "createdAt": "2026-09-19T06:45:32.186Z",
    "updatedAt": "2026-09-19T06:45:32.186Z"
  }
}
```

Создание заявки для несуществующего оборудования возвращает `404 Not Found`

## Переходы статусов заявки

Допустимы только следующие переходы:

| Текущий статус | Допустимый следующий статус |
| --- | --- |
| `new` | `in_progress`, `rejected` |
| `in_progress` | `done`, `rejected` |
| `done` | Переходы запрещены |
| `rejected` | Переходы запрещены |

Изменение выполняется через:

``` http
PATCH /api/requests/:id/status
Content-Type: application/json
```

``` json
{
  "status": "in_progress"
}
```

Недопустимый переход возвращает `409 Conflict`

## Фильтрация, сортировка и пагинация

### Equipment

`GET /api/equipment` поддерживает:

| Параметр | Значения / правило |
| --- | --- |
| `status` | `operational`, `maintenance`, `fault`, `decommissioned` |
| `type` | `turbine`, `inverter`, `sensor`, `substation` |
| `page` | Положительное целое, по умолчанию `1` |
| `limit` | Целое от 1 до 100, по умолчанию `20` |
| `sortBy` | `name`, `type`, `status`, `installedAt` |
| `order` | `asc` или `desc`, по умолчанию `asc` |

Пример:

``` http
GET /api/equipment?type=inverter&status=operational&sortBy=name&order=asc&page=1&limit=10
```

### Maintenance Requests

`GET /api/requests` поддерживает:

| Параметр | Значения / правило |
| --- | --- |
| `status` | `new`, `in_progress`, `done`, `rejected` |
| `priority` | `low`, `medium`, `high`, `critical` |
| `equipmentId` | UUID оборудования |
| `createdFrom` | ISO date-time, нижняя граница `createdAt` включительно |
| `createdTo` | ISO date-time, верхняя граница `createdAt` включительно |
| `page` | Положительное целое, по умолчанию `1` |
| `limit` | Целое от 1 до 100, по умолчанию `20` |
| `sortBy` | `createdAt`, `updatedAt`, `plannedAt`, `priority`, `status` |
| `order` | `asc` или `desc`, по умолчанию `asc` |

Пример:

``` http
GET /api/requests?status=new&priority=high&sortBy=createdAt&order=desc&page=1&limit=20
```

Endpoints возвращают:

``` json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20
  }
}
```

`total` содержит количество элементов после применения фильтров, но до
применения пагинации

## Weather API

Endpoint:

``` http
GET /api/equipment/:id/weather
```

Сервис:

1.  получает оборудование по `id`;
2.  использует `location.lat` и `location.lon`;
3.  запрашивает трёхдневный прогноз во внешнем Weather API;
4.  добавляет к каждому дню `suitableForOutdoorWork`.

Пример ответа:

``` json
{
  "data": {
    "equipmentId": "a8bd75b4-3bf4-4a30-bb38-c088b0cf8137",
    "location": {
      "lat": 55.7558,
      "lon": 37.6173
    },
    "timezone": "Europe/Moscow",
    "days": [
      {
        "date": "2026-09-20",
        "temperatureMax": 19.5,
        "temperatureMin": 11.1,
        "precipitation": 0,
        "windSpeedMax": 3.41,
        "suitableForOutdoorWork": true
      }
    ]
  }
}
```

Правило соответствия погодным условиям:

``` text
precipitation === 0
AND
windSpeedMax < WEATHER_MAX_WIND_SPEED
```

То есть день считается подходящим только при отсутствии осадков и
скорости ветра ниже настроенного порога

По умолчанию порог равен `15` м/с

Ошибки внешнего сервиса не приводят к падению приложения:

-   `502 Bad Gateway` - `WEATHER_SERVICE_ERROR` - ошибка внешнего Weather API, сети или некорректного ответа
-   `504 Gateway Timeout` - `WEATHER_TIMEOUT` - превышен `REQUEST_TIMEOUT_MS`

## Формат ответов

Одиночный ресурс возвращается в поле `data`:

``` json
{
  "data": {
    "id": "..."
  }
}
```

Список возвращается вместе с метаданными пагинации:

``` json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20
  }
}
```

Успешный `DELETE` возвращает `204 No Content` без тела

## Обработка ошибок

Ошибки приложения преобразуются централизованным обработчиком в
единый формат:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "priority",
        "message": "Invalid option"
      }
    ],
    "requestId": "b1f2c3d4"
  }
}
```

`details` присутствует у ошибок валидации и содержит сведения о
некорректных полях

Основные коды:

     HTTP `error.code`              Когда используется
  ------- ------------------------- --------------------------------------------
    `400` `BAD_REQUEST`             Некорректный JSON - malformed request body
    `404` `NOT_FOUND`               Ресурс не найден
    `409` `CONFLICT`                Операция противоречит текущему состоянию данных
    `413` `PAYLOAD_TOO_LARGE`       JSON превышает лимит `100kb`
    `422` `VALIDATION_ERROR`        Данные не соответствуют схеме
    `429` `RATE_LIMIT_EXCEEDED`     Превышен лимит запросов
    `502` `WEATHER_SERVICE_ERROR`   Ошибка внешнего погодного сервиса
    `504` `WEATHER_TIMEOUT`         Таймаут внешнего погодного сервиса
    `500` `INTERNAL_SERVER_ERROR`   Непредвиденная внутренняя ошибка

Внутренние детали и stack trace клиенту не возвращаются

### Пример ошибки валидации

Запрос:

``` http
POST /api/requests
Content-Type: application/json
```

``` json
{
  "equipmentId": "not-a-uuid",
  "title": "x",
  "priority": "urgent"
}
```

Пример ответа `422 Unprocessable Entity`:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "equipmentId",
        "message": "Invalid UUID"
      }
    ],
    "requestId": "..."
  }
}
```

Конкретный состав `details` зависит от входных данных и результатов
валидации

### Пример конфликта перехода статуса

Попытка перевести завершённую заявку из `done` обратно в `in_progress`:

``` http
PATCH /api/requests/:id/status
Content-Type: application/json
```

``` json
{
  "status": "in_progress"
}
```

Ответ `409 Conflict` имеет вид:

``` json
{
  "error": {
    "code": "CONFLICT",
    "message": "Cannot change request status from \"done\" to \"in_progress\"",
    "requestId": "..."
  }
}
```

## Безопасность

### CORS

CORS настроен через переменную окружения  `CORS_ORIGINS`, которая содержит список разрешённых origins через запятую 

Например, для локальной разработки:

```dotenv
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

Браузерные запросы разрешаются только для origins, указанных в этом списке

Запросы без заголовка `Origin` также допускаются, для обращения к API небраузерных клиентов, например Postman

Для production следует указывать только реальные origins
клиентских приложений, например:

``` dotenv
CORS_ORIGINS=https://app.example.com
```

### Rate limiting

Rate limiter применяется ко всем маршрутам `/api`

По умолчанию:

``` text
100 запросов / 60000 мс
```

Параметры задаются через:

``` dotenv
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

При превышении лимита возвращается `429 Too Many Requests`

`express-rate-limit` также добавляет стандартные заголовки, содержащие
информацию о лимите

### Ограничение тела запроса

JSON parser настроен с лимитом:

``` text
100kb
```

Слишком большое тело запроса возвращает `413 Payload Too Large`

### Защитные HTTP заголовки

Helmet подключён глобально устанавливая защитные HTTP заголовки

### SameSite и Secure

Приложение не использует cookie, поэтому атрибуты cookie `HttpOnly`,
`Secure` и `SameSite` в текущей реализации не применены

## Логирование и requestId

Каждому запросу присваивается уникальный `requestId`

HTTP-лог содержит:

-   `requestId`;
-   HTTP метод;
-   путь;
-   статус ответа;
-   длительность обработки в миллисекундах

Levels:

-   успешные ответы - `info`
-   ответы `4xx` - `warn`
-   ответы `5xx` и ошибки сервера - `error`

`requestId` возвращается клиенту в объекте ошибки, поэтому
ошибочный запрос можно сопоставить с записью в логах

Отладочные `console.log` в итоговой реализации не используются

## Postman

Экспортированная Postman Collection находится в:

``` text
docs/postman/
```

Коллекция сгруппирована по ресурсам и содержит запросы ко всем endpoint,
сохранённые примеры и `pm.test` проверки

Используется collection variables:

| Переменная | Назначение |
| --- | --- |
| `baseUrl` | Адрес API, по умолчанию `http://localhost:3000` |
| `equipmentId` | ID оборудования, автоматически сохраняемый после создания |
| `maintenanceRequestId` | ID заявки, автоматически сохраняемый после создания |

`equipmentId` и `maintenanceRequestId` в экспортированном файле
намеренно оставлены пустыми и заполняются во время выполнения
соответствующих POST запросов

Коллекция содержит негативные сценарии для:

-   `400` - malformed JSON
-   `422` - ошибка валидации
-   `404` - Not Found
-   `409` - дублирование серийного номера
-   `409` - удаление оборудования с открытой заявкой
-   `409` - недопустимая замена статуса
-   `429` - превышение rate limit

### Проверка 429 в Postman

Для ускоренной ручной проверки можно временно уменьшить лимит:

``` dotenv
RATE_LIMIT_MAX=3
RATE_LIMIT_WINDOW_MS=60000
```

После изменения `.env` перезапустите сервер и отправьте несколько
запросов к `/api` в пределах одного окна. 

Запрос сверх лимита должен вернуть `429`

Некоторые запросы коллекции зависят от сущностей, созданных предыдущими
запросами

Сначала создайте оборудование, затем заявку, после чего
выполняйте запросы, использующие сохранённые значения переменных

## NPM scripts

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Запуск development-сервера через `tsx watch` |
| `npm run build` | Компиляция TypeScript |
| `npm start` | Запуск собранного `dist/server.js` |
| `npm run typecheck` | Проверка типов без генерации файлов |
| `npm run lint` | Проверка ESLint |
| `npm run format` | Форматирование проекта с помощью Prettier |
| `npm run format:check` | Проверка форматирования без изменения файлов |

## Основные бизнес-правила

-   `id` оборудования и заявок генерируются сервером
-   `createdAt` и `updatedAt` заявки управляются сервером
-   Статус новой заявки всегда `new`
-   Заявку нельзя создать для несуществующего оборудования
-   `serialNumber` оборудования уникален
-   Статус заявки меняется только через `/api/requests/:id/status`
-   Переходы статуса из `done` и `rejected` запрещены
-   Оборудование нельзя удалить, пока у него есть заявки `new` или
    `in_progress`
-   Неизвестные поля тела запроса игнорируются
-   Все идентификаторы в параметрах API валидируются как UUID
-   Данные текущей реализации находятся в памяти и исчезают после
    перезапуска приложения

## HTTP коды

В API используются следующие основные статусы:

-   `200 OK` - успешное чтение или обновление
-   `201 Created` - ресурс создан
-   `204 No Content` - ресурс удалён
-   `400 Bad Request` - синтаксически некорректный JSON
-   `404 Not Found` - ресурс не найден
-   `409 Conflict` - нарушение бизнес правила, операция противоречит текущему состоянию данных
-   `413 Payload Too Large` - превышен лимит тела запроса
-   `422 Unprocessable Entity` - ошибка валидации
-   `429 Too Many Requests` - превышен rate limit
-   `502 Bad Gateway` - ошибка внешнего Weather API
-   `504 Gateway Timeout` - внешний Weather API не ответил вовремя
-   `500 Internal Server Error` - непредвиденная ошибка приложения
