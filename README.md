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
- массовый импорт заявок с частичным успешным выполнением и отчётом по каждой записи
- Веб-интерфейс для работы с оборудованием и заявками:
    - создание оборудования
    - подстановка ID созданного оборудования в форму заявки
    - создание заявок на обслуживание
    - просмотр и фильтрация заявок
    - просмотр прогноза погоды для оборудования
    - отображение пригодности погодных условий для работ на открытом воздухе

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
- PostgreSQL 17
- Sequelize 6
- Umzug

## Установка и запуск

Требуются Node.js 24, npm и Docker Compose v2

PostgreSQL 17 запускается в контейнере

Команды ниже выполняются из корня проекта в Bash / Git Bash.

Клонируйте репозиторий и установите зависимости:

``` bash
git clone https://github.com/ilia-kravtsov/equipment-maintenance-api.git
cd equipment-maintenance-api
npm ci
cp .env.example .env
```
В `.env` заполните `POSTGRES_PASSWORD` и `DB_PASSWORD` своими значениями
`POSTGRES_USER` - администратор для миграций, `DB_USER` - отдельная роль приложения
Имена ролей должны различаться. Для стандартного запуска `POSTGRES_DB` и `DB_NAME`
равны `equipment_maintenance`. На компьютере используются `DB_HOST=127.0.0.1`,
`POSTGRES_PORT=5433`, `DB_PORT=5433`. Пароли не добавляются в Git

```bash
docker compose up -d db
docker compose ps
```

Дождитесь состояния `healthy` у `db`, затем:

```bash
npm run db:setup-role
npm run db:migrate
npm run db:seed
npm run db:migrate:status
```

Порядок обязателен: роль создаётся до миграции выдачи прав; сиды - после таблиц.
Схема создаётся миграциями Umzug, `sync({ force: true })` не используется.
Сид `demo-data-v1` выполняется транзакционно и повторно пропускается по записи в `seed_runs`.
Он содержит 3 площадки, 11 единиц оборудования и паспортов, 34 заявки, 9 специалистов,
назначения и историю статусов

После подготовки БД выберите один способ запуска API:

```bash
# С компьютера
npm run dev
```

или:

```bash
# В Docker; локальный сервер на том же порту предварительно остановите
docker compose up -d --build api
docker compose ps
docker compose logs --tail=80 api
```

В контейнер API передаются `DB_HOST=db` и `DB_PORT=5432`; остальные параметры берутся из `.env`
Менять локальные `DB_HOST` и `DB_PORT` для этого не нужно
`depends_on` ожидает healthcheck БД, но не применяет миграции и сиды автоматически

По умолчанию сервер доступен по адресу:

``` text
http://localhost:3000
```

Проверки:

```http
GET /api/health
GET /api/reports/equipment-load?limit=1
```

Первый возвращает `200` и `{"status":"ok"}` второй подтверждает доступ к данным
При старте API выполняет `authenticate()`
Ошибка подключения диагностируется в логах
При SIGINT SIGTERM сервер прекращает приём соединений и закрывает пул Sequelize

## Cборка и запуск

``` bash
    npm run build
    npm start
```

`npm run build` компилирует TypeScript в `dist`

`npm start` запускает `dist/server.js`

### Веб-интерфейс

После запуска сервера веб-интерфейс доступен по адресу:

`http://localhost:3000/`

Для операций создания необходимо указать API ключ в верхней части страницы

Ключ используется для заголовка `X-API-Key` и хранится только в текущем DOM страницы - он не сохраняется в `localStorage`, `sessionStorage` или cookie

Через веб-интерфейс можно создать оборудование, получить для него прогноз погоды, создать заявку на обслуживание и отфильтровать список заявок

## Переменные окружения

| Переменная | Значение по умолчанию                                        | Назначение                                                                                       |
| --- |--------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| `PORT` | `3000`                                                       | Порт HTTP сервера. Допустимое значение: целое число от 1 до 65535                                |
| `NODE_ENV` | `development`                                                | Режим работы приложения                                                                          |
| `WEATHER_API_URL` | `https://api.open-meteo.com/v1/forecast`                     | URL внешнего API для получения прогнозов погоды                                                  |
| `REQUEST_TIMEOUT_MS` | `5000`                                                       | Таймаут запроса к внешнему API в миллисекундах                                                   |
| `WEATHER_MAX_WIND_SPEED` | `15`                                                         | Максимальная скорость ветра в м/с для соответствия требованиям погодных условий для наружных работ |
| `CORS_ORIGINS` | `[]`                                                         | Список разрешённых CORS origins через запятую. По умолчанию ни один browser origin не добавлен в allowlist. |                                             |
| `RATE_LIMIT_WINDOW_MS` | `60000`                                                      | Размер временного окна rate limiter в миллисекундах                                              |
| `RATE_LIMIT_MAX` | `100`                                                        | Максимальное количество запросов к `/api` в пределах одного окна rate limiter                    |
| `API_KEY` | `local-development-api-key` | API-ключ для мутирующих запросов `POST`, `PATCH`, `DELETE` |

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

Доступ к PostgreSQL реализован c помощью Sequelize

### App и Server

Сборка Express приложения находится в `src/app.ts`

Запуск HTTP сервера в `src/server.ts`

## Структура проекта

``` text
public/
    index.html
    styles.css
    js/
        api.js
        app.js
        equipment.js
        requests.js
        ui.js
        
src/
    api/             # HTTP клиент и клиент внешнего Weather API
    config/          # конфигурация и logger
    controllers/     # HTTP контроллеры
    errors/          # типы ошибок приложения
    middlewares/     # middleware Express
    models/          # модели и типы
    repositories/    # репозитории PostgreSQL и преобразование моделей
    routes/          # маршруты API
    services/        # бизнес логика
    validators/      # схемы Zod
    app.ts           # сборка Express приложения
    server.ts        # запуск сервера
    database/        # подключение Sequelize, модели БД, миграции, сиды и скрипты

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

### Endpoints

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
| `POST` | `/api/requests/import` | Массовый импорт заявок | `201` / `207` |

При успешном `POST` сервер также возвращает заголовок `Location` с
адресом созданного ресурса

> Все изменяющие endpoints (`POST`, `PATCH`, `DELETE`) требуют заголовок `X-API-Key`. `GET` endpoints доступны без аутентификации

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

### Массовый импорт заявок

Endpoint:

```http
POST /api/requests/import
X-API-Key: <API_KEY>
Content-Type: application/json
```

Тело запроса содержит от 1 до 100 заявок:

```json
{
  "requests": [
    {
      "equipmentId": "a8bd75b4-3bf4-4a30-bb38-c088b0cf8137",
      "title": "Inspect inverter cooling system",
      "priority": "high"
    },
    {
      "equipmentId": "invalid-id",
      "title": "Bad",
      "priority": "urgent"
    }
  ]
}
```

Каждый элемент валидируется и обрабатывается независимо. Ошибка одной заявки не прерывает импорт остальных.

Если все заявки успешно созданы, сервер возвращает `201 Created`.

Если хотя бы одну заявку создать не удалось, сервер возвращает `207 Multi-Status` с отчётом по каждому элементу:

```json
{
  "data": {
    "total": 2,
    "created": 1,
    "failed": 1,
    "results": [
      {
        "index": 0,
        "status": "created",
        "data": {
          "id": "...",
          "equipmentId": "a8bd75b4-3bf4-4a30-bb38-c088b0cf8137",
          "title": "Inspect inverter cooling system",
          "priority": "high",
          "status": "new",
          "createdAt": "...",
          "updatedAt": "..."
        }
      },
      {
        "index": 1,
        "status": "failed",
        "error": {
          "code": "VALIDATION_ERROR",
          "message": "Validation failed",
          "details": [
            {
              "field": "equipmentId",
              "message": "Invalid UUID"
            }
          ]
        }
      }
    ]
  }
}
```

Некорректная структура самого bulk запроса, например пустой массив `requests`, возвращает обычную ошибку `422 Unprocessable Entity`

За один запрос можно передать не более 100 заявок

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

### API key authentication

Изменяющие операции `POST`, `PATCH`, `DELETE` защищены API ключом

Ключ передаётся в HTTP-заголовке:

```text
X-API-Key: <API_KEY>
```

Операции чтения `GET` доступны без аутентификации

При отсутствии или неверном API ключе сервер возвращает `401 Unauthorized`:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key",
    "requestId": "..."
  }
}
```

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

Коллекция содержит 75 запросов, сгруппированных по проверяемым сценариям, 
сохранённые примеры ответов и проверки
`pm.test` для части запросов

Используется collection variables:

| Переменная | Назначение                                                       |
| --- |------------------------------------------------------------------|
| `baseUrl` | Адрес API, по умолчанию `http://localhost:3000`                  |
| `equipmentId` | ID оборудования, автоматически сохраняемый после создания        |
| `maintenanceRequestId` | ID заявки, автоматически сохраняемый после создания              |
| `apiKey` | API key для защищённых мутирующих запросов                       |
| `assigneeRequestId` | 	Отдельная заявка для проверки назначения и снятия исполнителей  |
| `leadTechnicianId` | 	ID ведущего специалиста                                         |
| `memberTechnicianId` | 	ID второго специалиста                                          |
| `equipmentWithPassportId` | 	Оборудование из сидов с паспортом |                               
| `equipmentWithoutPassportId` | 	Оборудование, созданное через API без паспорта |                  
| `siteId` | 	Площадка для проверки сводки |                                   
| `equipmentRequestsId` | 	Оборудование для проверки вложенного списка заявок|              |
| `firstEquipmentRequestId` | 	ID, сохраняемый скриптом проверки первой страницы               |
| `requestWithoutAssigneesId` | 	Отдельная заявка без назначенных исполнителей                   |

Экспорт может содержать UUID из последнего ручного прогона
Для новой БД необходимо создать соответствующие сущности
или выбрать их из сидов и обновить переменные

Скрипты запросов создания оборудования и заявки сохраняют
`equipmentId` и `maintenanceRequestId`
Сохранённые примеры ответов могут содержать прежние UUID и даты

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
| `npm test` | Запуск тестов Jest |

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
-   Данные хранятся в PostgreSQL и сохраняются после перезапуска API
    Docker Compose использует постоянный volume для данных БД
    Команда `docker compose down` сохраняет данные,
    а `docker compose down -v` удаляет volume вместе с данными.

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
-   `207 Multi-Status` - bulk import обработан, но одна или несколько заявок завершились ошибкой
-   `401 Unauthorized` - отсутствует или неверен API key

## Docker

Приложение можно запустить в Docker с помощью Docker Compose

### Запуск

Перед первым запуском API подготовьте `.env`, запустите БД
создайте роль приложения, примените миграции и сиды по инструкции
в разделе первоначального запуска

Затем соберите и запустите API:

```bash
docker compose up -d --build api
```

Миграции и сиды выполняются отдельными командами;
запуск контейнера API не заменяет подготовку базы данных.

После запуска приложение доступно по следующим адресам:

- Web UI: `http://localhost:3000/`
- Health check: `http://localhost:3000/api/health`

### Проверка состояния

Проверить состояние контейнера:

```bash
docker compose ps
```

После успешного запуска контейнер должен перейти в состояние `healthy`

Просмотреть логи приложения:

```bash
docker compose logs api
```

### Остановка

Остановить и удалить контейнер и созданную Docker Compose сеть:

```bash
docker compose down
```

### Переменные окружения

Docker Compose использует переменные окружения приложения

Пример конфигурации находится в файле `.env.example`

### Docker image

Для сборки используется multi-stage `Dockerfile`:

1. На этапе `builder` устанавливаются все зависимости и компилируется TypeScript
2. На этапе `runner` устанавливаются только production зависимости
3. В финальный образ копируются скомпилированный сервер и статический Web UI
4. Приложение запускается от непривилегированного пользователя `node`

## Кейс 3: схема БД и нормализация

Связь оборудования с площадкой необязательна: `equipment.site_id`
может быть `NULL`. У оборудования может отсутствовать паспорт.
Таблица `request_assignees` реализует связь многие-ко-многим
между заявками и специалистами и хранит роль и плановые часы.

`site_id` у оборудования допускает NULL для совместимости с прежним POST оборудования

В сидах всё оборудование связано с площадками

| Таблица | Ключи и назначение |
| --- | --- |
| `sites` | UUID PK, уникальный code; название, регион, координаты площадки |
| `equipment` | UUID PK, уникальный serial_number, FK site_id; собственные координаты оборудования |
| `equipment_passports` | equipment_id одновременно PK и FK: максимум один паспорт оборудования |
| `maintenance_requests` | UUID PK, FK equipment_id, статус, приоритет, автор, временные метки |
| `request_status_history` | UUID PK, FK request_id, прежний/новый статус, автор, комментарий, момент изменения |
| `technicians` | UUID PK, уникальный employee_number, ФИО и специализация |
| `request_assignees` | Составной PK (request_id, technician_id), роль и DECIMAL hours |

Атрибуты сущностей зависят от их ключей; сведения о площадке, паспорте и специалисте
не дублируются в заявках. Часы и роль зависят от пары «заявка — специалист» и находятся
в таблице связи N:M. Координаты оборудования описывают его собственное положение,
координаты площадки — положение площадки, поэтому совпадение в демонстрационных данных
не означает обязательное равенство этих значений.
История хранит события, а статус заявки — её текущее состояние; их согласованность
поддерживается транзакцией. Это обоснование разделения данных по 3НФ.

Статусы, приоритеты и роли ограничены CHECK; часы — DECIMAL с ограничением диапазона.
Моменты времени хранятся с часовым поясом, календарные даты — DATE.
Вспомогательные `SequelizeMeta` и `seed_runs` учитывают применённые миграции и сиды.

### Удаление и внешние ключи

| Ссылка                                        | ON DELETE | ON UPDATE |
|-----------------------------------------------| --- | --- |
| equipment - sites                             | RESTRICT | CASCADE |
| equipment_passports - equipment               | CASCADE | CASCADE |
| maintenance_requests - equipment              | RESTRICT | CASCADE |
| request_status_history - maintenance_requests | RESTRICT | RESTRICT |
| request_assignees - maintenance_requests      | CASCADE | CASCADE |
| request_assignees - technicians               | RESTRICT | CASCADE |

API использует soft delete оборудования и заявок. История и назначения при этом
сохраняются; обычное чтение исключает удалённые сущности. FK-действия относятся к
физическому DELETE, а не к обновлению deleted_at. Физическое удаление заявки с историей
блокирует RESTRICT. Серийный номер остаётся занят и после soft delete — это сознательная
глобальная уникальность, повторное использование даёт 409.

Удаление оборудования запрещено при заявках new/in_progress, включая заявки с soft delete.
Проверка и soft delete оборудования выполняются в транзакции под блокировкой его строки;
создание заявки блокирует ту же строку. История защищена от UPDATE/DELETE/TRUNCATE триггером.
У роли приложения для неё только SELECT/INSERT; для оборудования и заявок нет физического DELETE.

### Исходные данные Кейса 2

В исходном проекте использовались in-memory репозитории, а не файловое хранилище.
Постоянного файла с накопленными записями не было, поэтому перенос несуществующих файлов
не выполнялся. In-memory реализации удалены, демонстрационные данные подготовлены сидами.
Это отличие исходного проекта от формулировки ТЗ; сиды не выдаются за миграцию старых данных.

## Кейс 3: переменные БД

| Переменная | Пример/по умолчанию | Назначение |
| --- | --- | --- |
| POSTGRES_DB | equipment_maintenance | БД при первом создании volume |
| POSTGRES_USER | equipment_owner | Административная роль миграций |
| POSTGRES_PASSWORD | задать самостоятельно | Пароль администратора |
| POSTGRES_PORT | 5433 в .env.example | Порт PostgreSQL на компьютере |
| DB_HOST | 127.0.0.1 локально; db в Compose | Адрес БД |
| DB_PORT | 5433 локально; 5432 в Compose | Порт подключения |
| DB_NAME | equipment_maintenance | БД приложения и скриптов |
| DB_USER | equipment_app | Ограниченная роль приложения |
| DB_PASSWORD | задать самостоятельно | Пароль роли приложения |
| DB_POOL_MAX | 5 | Максимум соединений |
| DB_POOL_MIN | 0 | Минимум соединений |
| DB_POOL_ACQUIRE_MS | 30000 | Ожидание получения соединения |
| DB_POOL_IDLE_MS | 10000 | Время простоя соединения |

Изменение POSTGRES_PASSWORD после создания volume само по себе не меняет пароль роли
в PostgreSQL

Пароль DB_USER можно синхронизировать повторным `npm run db:setup-role`

У приложения один экземпляр Sequelize и пул; скрипты используют отдельное административное
соединение и закрывают его в finally. DB_USER отличается от POSTGRES_USER

## Кейс 3: новые endpoints и карточки

| Метод | Путь | Успех |
| --- | --- | --- |
| POST | /api/requests/:id/assignees | 204 |
| DELETE | /api/requests/:id/assignees/:userId | 204 |
| GET | /api/requests/:id/history | 200 |
| GET | /api/sites/:id/summary | 200 |
| GET | /api/reports/equipment-load | 200 |

POST/DELETE требуют X-API-Key. GET доступны без ключа.

Назначение полностью заменяет бригаду:

```json
{
  "assignees": [
    {"technicianId": "c2ef06b9-a9fa-4a33-85c1-4ff69177d3e5", "role": "lead", "hours": 4},
    {"technicianId": "27dbd384-68b1-45a2-86b0-fd11065aa2bb", "role": "member", "hours": 2}
  ]
}
```

Заявка блокируется FOR UPDATE; прежние назначения удаляются, проверяется ровно один lead,
новые назначения вставляются в той же транзакции. Ошибка вызывает rollback. Пустая бригада,
ноль или два ведущих дают 422; дубликат специалиста в списке — 409; неизвестный специалист — 404.
Повторить корректный состав разрешено: это замена, а не добавление к прежним строкам.
Принимается максимум 100 назначений, hours от 0 до 999999.99 с шагом 0.01.

userId в DELETE — UUID специалиста. Нельзя снять ведущего, оставив участников (409),
и последнего исполнителя с in_progress (409). Отсутствующее назначение возвращает 404.
Для смены ведущего используется полная замена состава.

GET карточки заявки возвращает `data.assignees`: technicianId, role, hours (число),
fullName, specialization, employeeNumber. Без назначений — [].
GET карточки оборудования возвращает `data.passport`: equipmentId, manufacturer, model,
ratedPowerKw (число), lastVerifiedAt (YYYY-MM-DD или null); без паспорта — null.
Загрузка выполняется через include с явным attributes. В списках и ответах на запись
эти дополнительные поля не гарантируются: они включаются при загрузке связи.

История возвращается как `{ "data": [...] }`, сортируется по changedAt и id.
Поля: id, requestId, previousStatus, newStatus, changedBy, comment, changedAt (ISO).
Начальная запись имеет previousStatus=null. Несуществующая или soft-deleted заявка — 404.
API изменения и удаления истории отсутствует.

### Статусы и rollback

Допустимы new → in_progress/rejected и in_progress → done/rejected.
Повторный переход в тот же статус и выход из done/rejected дают 409.
Без исполнителей переход в in_progress даёт 409. Обновление статуса и INSERT истории
выполняются в одной транзакции под блокировкой строки заявки. Назначение и снятие специалистов
используют ту же блокировку. transaction передаётся всем запросам операции.

Для демонстрации rollback назначьте исходную бригаду, затем отправьте состав с дубликатом
или несуществующим специалистом. После 409/404 получите карточку: роли и часы должны
сохраниться. Ошибка возникает после удаления прежних назначений внутри транзакции.
Дополнительный тест `tests/request-status-rollback.test.ts` намеренно вызывает ошибку
записи истории после UPDATE заявки; проверяет сохранность статуса/updatedAt/истории и успешный повтор.

## Отчёты

### Сводка площадки

`GET /api/sites/:id/summary` возвращает siteId, totalRequests, byStatus, byPriority,
averageClosureHours. Суммы каждого набора счётчиков равны totalRequests.
Среднее вычисляется только для done: от created_at до последнего события перехода в done,
а не до updated_at. Без завершённых заявок среднее null; пустая площадка даёт нулевые счётчики.
Несуществующая площадка — 404, некорректный UUID — 422.

### Нагрузка на оборудование

`GET /api/reports/equipment-load` возвращает массив data с equipmentId, equipmentName,
serialNumber, requestCount, closedRequestCount, totalPlannedHours, lastServiceAt.
Закрытыми считаются done; rejected учитываются только в общем количестве.

| Параметр | Правило |
| --- | --- |
| from / to | Необязательные ISO datetime с часовым поясом; границы включительны |
| minRequests | Целое 0..2147483647, по умолчанию 0; применяется через HAVING |
| limit | Целое 1..100, по умолчанию 20 |
| offset | Целое 0..10000, по умолчанию 0 |

Период фильтрует created_at заявки. lastServiceAt — последнее завершение среди выбранных
заявок, оно может быть вне периода создания. Часы включают все текущие назначения выбранных
заявок. При minRequests=0 оборудование без заявок возвращается с нулями и lastServiceAt=null.
Порядок фиксирован по equipmentId. Отчёт не возвращает общее число групп до пагинации.
Неверные параметры и обратный период — 400 BAD_REQUEST. Оба отчёта исключают soft-deleted
оборудование и заявки. Заявки оборудования без site_id участвуют в отчёте нагрузки,
но не в сводке конкретной площадки.

```http
GET /api/reports/equipment-load?minRequests=4&limit=100
GET /api/reports/equipment-load?from=2026-08-01T00:00:00Z&to=2026-08-31T23:59:59.999999Z&minRequests=1
```

SQL использует JOIN, COUNT/SUM/MAX/AVG, GROUP BY и HAVING. Подзапросы LATERAL сводят
часы и дату закрытия к одной строке на заявку, поэтому история и бригада не умножают
счётчики. Пользовательские значения передаются через bind. Поля сортировки основных
списков проверяются по белому списку, сортировка отчёта фиксирована.

### Пагинация списков

Endpoints `/api/equipment`, `/api/requests` и
`/api/equipment/:id/requests` поддерживают пагинацию:

- `page` - целое число от 1, по умолчанию 1
- `limit` - целое число от 1 до 100, по умолчанию 20
- вычисляемый `offset = (page - 1) * limit` не должен превышать 10000

Некорректные параметры пагинации возвращают `400 BAD_REQUEST`
Остальные ошибки валидации параметров списка возвращают `422`

Фильтрация, сортировка и пагинация выполняются в PostgreSQL

`/api/equipment` и `/api/requests` возвращают массив `data`
и метаданные пагинации `meta`.

`/api/equipment/:id/requests` сохраняет формат `{ "data": [...] }`
без `meta`, но возвращает только запрошенную страницу.
Без параметров возвращаются первые 20 заявок оборудования.

Вложенный список заявок поддерживает фильтры `status`, `priority`,
`createdFrom`, `createdTo`, сортировку `sortBy` и направление `order`

Допустимые значения `sortBy`: `createdAt`, `updatedAt`, `plannedAt`,
`priority`, `status`. Направление `order`: `asc` или `desc`

Оборудование определяется параметром `:id` в URL:
параметр `equipmentId` в query не позволяет получить заявки другого
оборудования. Для отсутствующего или удалённого оборудования возвращается `404`

## Миграции: откат и восстановление

```bash
npm run db:migrate:status
npm run db:migrate:undo
npm run db:migrate
```

Откат последней миграции и полное удаление схемы — разные операции. Перед откатом
остановите API. Для полного цикла используйте отдельную одноразовую БД: down-all удаляет
таблицы и данные; повторное применение сидов восстанавливает только демонстрационные записи.

```bash
# Только для подготовленной одноразовой БД, например equipment_maintenance_review
DB_NAME=equipment_maintenance_review npm run db:setup-role
DB_NAME=equipment_maintenance_review npm run db:migrate
DB_NAME=equipment_maintenance_review npm run db:seed
DB_NAME=equipment_maintenance_review npm run db:migrate:undo:all
DB_NAME=equipment_maintenance_review npm run db:migrate
DB_NAME=equipment_maintenance_review npm run db:seed
```

Создать такую БД можно администратором в psql (`CREATE DATABASE equipment_maintenance_review;`).
Полный цикл применения, отката и повторного применения проверялся разработчиком.
`docker compose down` сохраняет volume; `docker compose down -v` удаляет данные и не нужен
для штатной остановки. Для сохранения пользовательских записей перед разрушительными операциями:

```bash
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > maintenance.backup
```

Восстановление в новую пустую БД с тем же владельцем выполняется через pg_restore;
имя целевой БД задаётся явно. Например, после `CREATE DATABASE equipment_maintenance_restore;`:

```bash
docker compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d equipment_maintenance_restore --exit-on-error' < maintenance.backup
```

Для запуска API на восстановленной БД задайте DB_NAME, выдайте CONNECT/USAGE через
`db:setup-role`, убедитесь в доступности роли приложения. Команды backup/restore не
проверялись в рамках ручного прогона API; они приведены как процедура восстановления.

## Тестовая БД

Jest использует `equipment_maintenance_test`; очистка другой БД запрещена проверками
имени и NODE_ENV. Тесты используют административную роль для fixtures и очистки,
API — роль приложения. Запуск однопоточный (maxWorkers=1).
В psql администратора один раз выполните:

```sql
CREATE DATABASE equipment_maintenance_test;
```

Затем из Git Bash:

```bash
DB_NAME=equipment_maintenance_test npm run db:setup-role
DB_NAME=equipment_maintenance_test npm run db:migrate
npm test -- --runInBand
```

Сиды для тестов не нужны: fixtures создаются тестами. Текущая очистка выполняется
перед каждым тестовым файлом, а не перед каждым отдельным тестом. Полный бонус за
изоляцию каждого теста отдельно не заявляется.

## Порядок ручной проверки Postman

Файл: `docs/postman/Equipment-maintenance-api.postman_collection.json` (учитывайте регистр имени).
Коллекция предназначена прежде всего для ручной проверки; запуск всех папок подряд
в Collection Runner не является автономным сценарием. Сохранённые ответы — примеры,
они не заменяют повторный запуск теста и могут содержать прежние UUID и времена.

1. Примените сиды. baseUrl=http://localhost:3000; apiKey должен совпадать с локальным API_KEY.
2. Создайте оборудование с новым уникальным serialNumber. Не удаляйте его до проверки заявок.
3. Создайте заявку; переменная maintenanceRequestId заполняется скриптом POST.
4. Перед успешным PATCH статуса назначьте бригаду этому ID через POST Assign lead before starting request
   Старый сценарий перехода без бригады теперь обязан давать 409 — это требование Кейса 3.
5. Для папки Request assignees создайте отдельную новую заявку, запишите её ID в assigneeRequestId.
   leadTechnicianId=c2ef06b9-a9fa-4a33-85c1-4ff69177d3e5,
   memberTechnicianId=27dbd384-68b1-45a2-86b0-fd11065aa2bb (из сидов).
6. Проверяйте папку по порядку: запрет старта, назначение, ошибки замены, снятие,
   старт работ, запрет снятия последнего. Повторный полный прогон требует новой заявки.
7. Для паспортов выберите оборудование из сидов и отдельное созданное через API оборудование.
   Обновите equipmentWithPassportId и equipmentWithoutPassportId.
8. Для Reports можно использовать siteId=dc244d28-9d1f-45d7-ace2-326e466ced39.
9. У запроса «Get request without assigned technicians» замените сохранённый UUID на ID
   новой заявки без бригады. Не используйте ID завершённой проверки назначений.
10. Проверки удаления запускайте последними. Для «401 Missing API Key» выбран No Auth,
    иначе наследование ключа коллекции мешает проверить отсутствие ключа.

Новые коды пагинации — 400, ошибки тела/UUID — 422, дубликаты — 409, отсутствующие связи — 404.
Тест 429 требует предварительного исчерпания лимита и не проходит обычным одиночным запросом.
Результаты ручной проверки назначения/rollback, карточек, сводки, SQL-отчёта и Docker
подтверждены разработчиком. После изменений кода выполнен полный запуск:

```bash
npm test -- --runInBand
```

Результат: 11 тестовых наборов и 46 тестов прошли успешно.

Проверки включают откат изменения статуса при ошибке записи истории,
успешный повтор операции, пагинацию заявок оборудования
и ограничение выборки указанным оборудованием.
