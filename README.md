# Equipment Maintenance API

REST API для учёта оборудования и заявок на его техническое обслуживание

Сервис ведёт учёт оборудования, контролирует жизненный цикл
заявок, поддерживает фильтрацию, сортировку, пагинацию и позволяет
получить прогноз погоды по координатам с оценкой
соответствия погодных условий для проведения наружных работ

## Возможности

- CRUD оборудования и заявок, фильтрация, сортировка, пагинация
- Площадки, паспорта оборудования, назначение исполнителей
- Переходы статусов и история изменений в транзакциях
- Soft delete оборудования и заявок
- Массовый импорт заявок с результатом по каждой записи
- Прогноз Open Meteo и оценка условий для наружных работ
- Регистрация, вход, обновление и завершение сессии
- Создание администратора
- Веб интерфейс

## Стек

- Node.js 24, TypeScript, Express 5
- PostgreSQL 17, Sequelize 6, Umzug
- Zod, Pino, Helmet, CORS, express-rate-limit
- bcrypt, jsonwebtoken, cookie-parser
- Jest, Supertest, Docker Compose

## Развёртывание и HTTPS: 

[инструкция](docs/deployment.md)

## Установка

Требуются:

- Node.js 24
- npm
- Docker Compose v2

Команды - для Git Bash

```bash
git clone https://github.com/ilia-kravtsov/equipment-maintenance-api.git
cd equipment-maintenance-api
npm ci
cp .env.example .env
```

В `.env` задайте:

- `POSTGRES_PASSWORD` - пароль роли администратора БД
- `DB_PASSWORD`
- `ACCESS_TOKEN_SECRET`

Скопируйте результат в `ACCESS_TOKEN_SECRET`:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```
## Подготовка БД

```bash
docker compose up -d db
docker compose ps
```

После состояния `healthy`:

```bash
npm run db:setup-role
npm run db:migrate
npm run db:seed
npm run db:migrate:status
```

- Порядок: роль - миграции - сиды
- `POSTGRES_USER` и `DB_USER` должны различаться
- Повторный запуск сида `demo-data-v1` пропускается по записи в `seed_runs`
- Сиды: 3 площадки, 11 единиц оборудования с паспортами, 34 заявки, 9 специалистов

## Запуск

### Локально

```bash
npm run dev
```

`tsx watch` - перезапускает сервер после изменения файлов

Остановка: 

`Ctrl+C`

### В Docker

```bash
docker compose up -d --build api
docker compose ps
docker compose logs --tail=80 api
```

Для перехода с Docker на локальный запуск:

```bash
docker compose stop api
npm run dev
```

Одновременно запускайте только один API на порту `3000`.

| Адрес | Назначение |
| --- | --- |
| http://localhost:3000/ | Веб-интерфейс |
| http://localhost:3000/api/health | Проверка доступности |
| http://localhost:3000/api-docs/ | Swagger UI |
| http://localhost:3000/openapi.json | OpenAPI 3.0.3 |

OpenAPI на данный момент описывает пять auth endpoints

Остальные маршруты приведены ниже и в Postman

## Структура

| Каталог | Назначение                                                                          |
| --- |-------------------------------------------------------------------------------------|
| `src/routes` | Маршруты и middleware маршрутов|
| `src/controllers` | Контроллеры|
| `src/services` | Бизнес логика|
| `src/repositories/contracts` | Интерфейсы репозиториев|
| `src/repositories/postgres` | Реализации: `auth`, `equipment`, `reports`, `requests`, `users`|
| `src/repositories/postgres/mappers` | Преобразование моделей Sequelize|
| `src/repositories/postgres/shared` | Общая обработка ошибок БД |
| `src/database` | Подключение, модели, миграции, сиды, скрипты|
| `src/models` | Типы: `auth`, `equipment`, `requests`, `reports`, `weather`, `shared`|
| `src/validators` | Схемы Zod|
| `src/middlewares` | Middleware: `auth`, `errors`, `validation`, `http`|
| `src/config` | Конфигурация и логирование|
| `src/api` | Клиент внешнего API|
| `src/errors` | Ошибки приложения|
| `src/docs` | OpenAPI-спецификация |
| `public` | Веб-интерфейс|
| `tests` | Тесты: `auth`, `equipment`, `requests`, `weather`, `http`; общие настройки и `helpers` |
| `docs/postman` | Коллекция Postman |

Поток обработки: routes - controllers - services - repositories

`src/app.ts` собирает приложение
`src/server.ts` запускает HTTP-сервер

## NPM scripts

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Запуск через `tsx watch` с перезапуском при изменениях |
| `npm run build` | Компиляция TypeScript в `dist` |
| `npm start` | Запуск собранного `dist/server.js` |
| `npm run typecheck` | Проверка типов без генерации файлов |
| `npm run lint` | Проверка ESLint в `src` |
| `npm run format` | Форматирование проекта через Prettier |
| `npm run format:check` | Проверка форматирования без изменения файлов |
| `npm test` | Запуск тестов Jest |
| `npm run db:setup-role` | Настройка роли приложения и прав доступа к БД |
| `npm run db:migrate:status` | Список применённых и ожидающих миграций |
| `npm run db:migrate` | Применение ожидающих миграций |
| `npm run db:migrate:undo` | Откат последней миграции |
| `npm run db:migrate:undo:all` | Откат всех миграций с удалением таблиц и данных |
| `npm run db:check-models` | Проверка моделей Sequelize |
| `npm run db:seed` | Загрузка демонстрационных данных |
| `npm run db:bootstrap-admin` | Создание первого администратора через TypeScript-скрипт |
| `npm run db:bootstrap-admin:prod` | Создание первого администратора из собранного `dist` |

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

## Аутентификация и доступ

- Регистрация создаёт пользователя с ролью `viewer`
- Пароли хешируются через bcrypt
- Access token передаётся в `Authorization: Bearer <token>`
- Refresh token хранится в HttpOnly cookie и заменяется при refresh
- Повторное использование старого refresh token возвращает `401`
- Logout отзывает сессию, её access token больше не принимается
- Login имеет отдельный rate limit

| Метод | Путь | Доступ | Статус |
| --- | --- | --- |--------|
| POST | `/api/auth/register` | Без токена | 201    |
| POST | `/api/auth/login` | Без токена | 200    |
| POST | `/api/auth/refresh` | Refresh cookie | 200    |
| POST | `/api/auth/logout` | Refresh cookie, необязательна | 204    |
| GET | `/api/auth/me` | Bearer access token | 200    |

Register и login принимают JSON с

`email`
`password`

Login и refresh возвращают 

`data.user`
`data.accessToken`
`data.accessTokenExpiresIn`

### Администратор

После миграций задайте в `.env` значения 

`BOOTSTRAP_ADMIN_EMAIL` 
`BOOTSTRAP_ADMIN_PASSWORD`

```bash
npm run db:bootstrap-admin
```

Вход администратора - через `/api/auth/login`

### Доступ к бизнес операциям

Все запросы требуют Bearer access token: 

без токена - `401`
без прав - `403`

| Операция | viewer | technician | admin |
| --- | --- | --- | --- |
| Чтение оборудования, заявок, истории и отчётов | Да | Да | Да |
| Создание, импорт и редактирование заявок | Нет | Да | Да |
| Смена статуса заявки | Нет | Только назначенные | Да |
| Изменение оборудования, назначение бригад, удаление | Нет | Нет | Да |

Web UI: вход по email и паролю, выход, восстановление сессии после обновления страницы

## API оборудования и заявок

URL по умолчанию: `http://localhost:3000`.

| Метод | Путь | Назначение | Статус    |
| --- | --- | --- |-----------|
| GET | `/api/health` | Доступность API | 200       |
| GET | `/api/equipment` | Список оборудования | 200       |
| POST | `/api/equipment` | Создать оборудование | 201       |
| GET | `/api/equipment/:id` | Карточка с паспортом | 200       |
| PATCH | `/api/equipment/:id` | Обновить оборудование | 200       |
| DELETE | `/api/equipment/:id` | Soft delete оборудования | 204       |
| GET | `/api/equipment/:id/requests` | Заявки оборудования | 200       |
| GET | `/api/equipment/:id/weather` | Прогноз погоды | 200       |
| GET | `/api/requests` | Список заявок | 200       |
| POST | `/api/requests` | Создать заявку | 201       |
| GET | `/api/requests/:id` | Карточка с исполнителями | 200       |
| PATCH | `/api/requests/:id` | Обновить поля заявки | 200       |
| PATCH | `/api/requests/:id/status` | Изменить статус | 200       |
| DELETE | `/api/requests/:id` | Soft delete заявки | 204       |
| POST | `/api/requests/import` | Импорт до 100 заявок | 201 / 207 |
| POST | `/api/requests/:id/assignees` | Заменить состав исполнителей | 204       |
| DELETE | `/api/requests/:id/assignees/:userId` | Снять исполнителя | 204       |
| GET | `/api/requests/:id/history` | История статусов | 200       |
| GET | `/api/sites/:id/summary` | Сводка площадки | 200       |
| GET | `/api/reports/equipment-load` | Нагрузка на оборудование | 200       |

`userId` в маршруте снятия исполнителя - UUID специалиста

### Основные правила

- Новая заявка получает статус `new`
- Переходы: `new - in_progress | rejected`, `in_progress - done | rejected`
- Из `done` и `rejected` переходы запрещены
- Для `in_progress` необходима бригада
- При назначении бригады требуется ровно один `lead`, остальные - `member`
- Нельзя снять `lead`, оставив `member`, или последнего исполнителя у `in_progress`
- Статус и запись истории изменяются в одной транзакции
- При ошибке замены бригады прежние назначения сохраняются
- Оборудование нельзя удалить при заявках `new` | `in_progress`
- История статусов защищена от изменения и удаления
- Отсутствующий паспорт возвращается как `null`, отсутствие исполнителей - как `[]`

### Списки

| Параметр | Оборудование                            | Заявки                                                         |
| --- |-----------------------------------------|----------------------------------------------------------------|
| Фильтры | `type`, `status`                        | `status`, `priority`, `equipmentId`, `createdFrom`, `createdTo` |
| `sortBy` | `name`, `type`, `status`, `installedAt` | `createdAt`, `updatedAt`, `plannedAt`, `priority`, `status`    |
| `order` | `asc` / `desc`| `asc` / `desc`|
| `page` | От 1, по умолчанию 1| От 1, по умолчанию 1|
| `limit` | 1-100, по умолчанию 20| 1-100, по умолчанию 20|

- Максимальный вычисляемый `offset` - 10000
- Cписки: `{ "data": [], "meta": { "total": 0, "page": 1, "limit": 20 } }`
- Заявки оборудования: `{ "data": [] }`, с пагинацией и фильтрами заявок, оборудование задаётся в URL
- Фильтрация, сортировка и пагинация выполняются в PostgreSQL

### Импорт и отчёты

- Импорт: `{ "requests": [...] }`, от 1 до 100 записей
- Все записи созданы: `201`, есть ошибки отдельных записей: `207`
- Количество заявок по статусам и приоритетам, среднее время до `done`
- Нагрузка: количество заявок, количество `done`, плановые часы, последнее завершение работ
- Фильтры нагрузки: `from`, `to`, `minRequests`, `limit`, `offset`
- Период отчёта фильтрует дату создания заявки
- Отчёты исключают soft deleted оборудование и заявки

## Конфигурация

Значения ниже — из `.env.example`.

| Переменная | Значение | Назначение                                             |
| --- | --- |--------------------------------------------------------|
| `PORT` | `3000` | Порт API                                               |
| `NODE_ENV` | `development` | Режим для разработки                                   |
| `CORS_ORIGINS` | `http://localhost:8080,http://localhost:3000,http://localhost:5173` | Разрешённые origins                                    |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Окно лимита `/api`, мс                                 |
| `RATE_LIMIT_MAX` | `100` | Запросов за окно                                       |
| `WEATHER_API_URL` | `https://api.open-meteo.com/v1/forecast` | Погодный API                                           |
| `REQUEST_TIMEOUT_MS` | `5000` | Таймаут внешнего запроса, мс                           |
| `WEATHER_MAX_WIND_SPEED` | `15` | Порог ветра, м/с                                       |
| `POSTGRES_DB` | `equipment_maintenance` | БД контейнера                                          |
| `POSTGRES_USER` | `equipment_owner` | Административная роль                                  |
| `POSTGRES_PASSWORD` | Задать | Пароль административной роли                           |
| `POSTGRES_PORT` | `5433` | Порт БД на компьютере                                  |
| `DB_HOST` | `127.0.0.1` | Адрес БД для локального API                            |
| `DB_PORT` | `5433` | Порт подключения                                       |
| `DB_NAME` | `equipment_maintenance` | БД приложения                                          |
| `DB_USER` | `equipment_app` | Роль приложения                                        |
| `DB_PASSWORD` | Задать | Пароль роли приложения                                 |
| `DB_POOL_MAX` / `DB_POOL_MIN` | `5` / `0` | Размер пула                                            |
| `DB_POOL_ACQUIRE_MS` | `30000` | Ожидание соединения, мс                                |
| `DB_POOL_IDLE_MS` | `10000` | Простой соединения, мс                                 |
| `ACCESS_TOKEN_SECRET` | Задать | Секрет подписи JWT                                     |
| `ACCESS_TOKEN_TTL_SECONDS` | `900` | Срок access token, с                                   |
| `REFRESH_SESSION_TTL_DAYS` | `7` | Срок refresh-сессии, дни                               |
| `BCRYPT_ROUNDS` | `12` | Cost factor bcrypt                                     |
| `LOGIN_RATE_LIMIT_WINDOW_MS` | `900000` | Окно лимита входа, мс                                  |
| `LOGIN_RATE_LIMIT_MAX` | `10` | Попыток входа за окно                                  |
| `BOOTSTRAP_ADMIN_EMAIL` | Задать | Email администратора                                   |
| `BOOTSTRAP_ADMIN_PASSWORD` | Задать | Пароль администратора                                  |
| `LOG_LEVEL` | `info` | Уровень логирования                                    |
| `HTTP_PORT` | `8080` | Внешний HTTP порт Nginx; на сервере - `80`             |
| `TRUST_PROXY` | `0` | `0` - отключено, `1` - один прокси, Compose задаёт `1` |

В Compose API использует `DB_HOST=db`, `DB_PORT=5432`
Локальные значения `.env` менять не требуется

## Хранение данных

- Основные сущности: площадки, оборудование, паспорта, заявки, специалисты, назначения, история статусов
- Auth: пользователи и refresh-сессии
- Схема БД управляется миграциями Umzug, сиды учитываются в `seed_runs`
- При завершении API закрывает HTTP сервер и пул БД
- Данные PostgreSQL хранятся в Docker volume

Проверка и применение миграций:

```bash
npm run db:migrate:status
npm run db:migrate
```

Откат последней миграции - после остановки API:

```bash
npm run db:migrate:undo
```

`db:migrate:undo:all` удаляет схему и данные
`docker compose down` сохраняет volume 
`docker compose down -v` удаляет данные

## Тесты

Создайте отдельную БД через psql:

```bash
docker compose exec db psql -U equipment_owner -d equipment_maintenance
```

```sql
CREATE DATABASE equipment_maintenance_test;
\q
```

```bash
DB_NAME=equipment_maintenance_test npm run db:setup-role
DB_NAME=equipment_maintenance_test npm run db:migrate
npm test -- --runInBand
```

- Сиды не нужны: тесты создают fixtures
- Проверяются API, валидация, бизнес-правила, rollback, пагинация и auth
- После реорганизации каталогов: 19 наборов, 106 тестов прошли успешно

## Docker

### Запуск

Перед первым запуском API подготовьте `.env`, запустите БД
создайте роль приложения, примените миграции и сиды по инструкции
в разделе первоначального запуска

Затем соберите и запустите API:

```bash
docker compose up -d --build api
```
Миграции и сиды выполняются отдельными командами;

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

Для сборки используется multi stage `Dockerfile`:

1. На этапе `builder` устанавливаются все зависимости и компилируется TypeScript
2. На этапе `runner` устанавливаются только production зависимости
3. В финальный образ копируются скомпилированный сервер и статический Web UI
4. Приложение запускается от непривилегированного пользователя `node`

## Кейс 3: схема БД и нормализация

Связь оборудования с площадкой необязательна: 
`equipment.site_id` может быть `NULL`

У оборудования может отсутствовать паспорт

Таблица `request_assignees` реализует связь Many To Many
между заявками и специалистами и хранит роль и плановые часы

`site_id` у оборудования допускает NULL для совместимости с прежним POST оборудования

В сидах всё оборудование связано с площадками

| Таблица | Ключи и назначение                                                                 |
| --- |------------------------------------------------------------------------------------|
| `sites` | UUID PK, уникальный code, название, регион, координаты площадки                    |
| `equipment` | UUID PK, уникальный serial_number, FK site_id, собственные координаты оборудования |
| `equipment_passports` | equipment_id одновременно PK и FK: максимум один паспорт оборудования              |
| `maintenance_requests` | UUID PK, FK equipment_id, статус, приоритет, автор, временные метки                |
| `request_status_history` | UUID PK, FK request_id, прежний/новый статус, автор, комментарий, момент изменения |
| `technicians` | UUID PK, уникальный employee_number, ФИО и специализация                           |
| `request_assignees` | Составной PK (request_id, technician_id), роль и DECIMAL hours                     |

Атрибуты сущностей зависят от их ключей, сведения о площадке, паспорте и специалисте
не дублируются в заявках

Часы и роль зависят от пары «заявка - специалист» и находятся
в таблице связи N:M

История хранит события, статус заявки - её текущее состояние, 
согласованность поддерживается транзакцией

Статусы, приоритеты и роли ограничены CHECK; 

часы - DECIMAL с ограничением диапазона

Календарные даты - DATE

Вспомогательные `SequelizeMeta` и `seed_runs` учитывают применённые миграции и сиды

### Удаление и внешние ключи

| Ссылка                                        | ON DELETE | ON UPDATE |
|-----------------------------------------------| --- | --- |
| equipment - sites                             | RESTRICT | CASCADE |
| equipment_passports - equipment               | CASCADE | CASCADE |
| maintenance_requests - equipment              | RESTRICT | CASCADE |
| request_status_history - maintenance_requests | RESTRICT | RESTRICT |
| request_assignees - maintenance_requests      | CASCADE | CASCADE |
| request_assignees - technicians               | RESTRICT | CASCADE |

API использует soft delete оборудования и заявок

История и назначения при этом сохраняются

Обычное чтение исключает удалённые сущности

FK действия относятся к физическому DELETE, а не к обновлению deleted_at

Физическое удаление заявки с историей блокирует RESTRICT

Серийный номер остаётся занят и после soft delete, повторное использование даёт 409

Удаление оборудования запрещено при заявках new | in_progress, включая заявки с soft delete

История защищена от UPDATE/DELETE/TRUNCATE триггером

### Исходные данные Кейса 2

В исходном проекте использовались in memory репозитории, а не файловое хранилище

In memory реализации удалены, демонстрационные данные подготовлены сидами

## Кейс 3: Карточки

```json
{
  "assignees": [
    {"technicianId": "c2ef06b9-a9fa-4a33-85c1-4ff69177d3e5", "role": "lead", "hours": 4},
    {"technicianId": "27dbd384-68b1-45a2-86b0-fd11065aa2bb", "role": "member", "hours": 2}
  ]
}
```

Заявка блокируется FOR UPDATE

Прежние назначения удаляются, проверяется ровно один lead

Новые назначения вставляются в той же транзакции

Ошибка вызывает rollback

Пустая бригада, ноль или два ведущих дают - 422

Дубликат специалиста в списке - 409

Неизвестный специалист - 404

Повторить корректный состав разрешено: в таком случае произойдет замена

Принимается максимум 100 назначений, hours от 0 до 999999.99 с шагом 0.01

userId в DELETE - UUID специалиста. Нельзя снять lead, оставив members - 409

И последнего исполнителя с in_progress - 409

Для смены lead используется полная замена состава

### Rollback

Для демонстрации rollback назначьте бригаду, затем отправьте состав с дубликатом
или несуществующим специалистом. После 409 | 404 получите карточку: 
роли и часы должны сохраниться

Ошибка возникает после удаления прежних назначений внутри транзакции.

Дополнительный тест `tests/request-status-rollback.test.ts` намеренно вызывает ошибку
записи истории после UPDATE заявки, проверяет сохранность статуса, updatedAt, и успешный повтор

## Отчёты

### Нагрузка на оборудование

`GET /api/reports/equipment-load` возвращает массив data с 

`equipmentId`
`equipmentName`
`serialNumber`
`requestCount`
`closedRequestCount`
`totalPlannedHours`
`lastServiceAt`

Закрытыми считаются - `done`

Период фильтрует `created_at` заявки

`lastServiceAt` - последнее завершение среди выбранных заявок

Часы включают все текущие назначения выбранных заявок

При minRequests=0 оборудование без заявок возвращается с нулями и `lastServiceAt` = null

Отчёты исключают soft-delete оборудования и заявки

```http
GET /api/reports/equipment-load?minRequests=4&limit=100
GET /api/reports/equipment-load?from=2026-08-01T00:00:00Z&to=2026-08-31T23:59:59.999999Z&minRequests=1
```

SQL использует JOIN, COUNT/SUM/MAX/AVG, GROUP BY и HAVING

Пользовательские значения передаются через bind

### Пагинация списков

Endpoints `/api/equipment`, `/api/requests` и
`/api/equipment/:id/requests` поддерживают пагинацию:

- `page` - целое число от 1, по умолчанию 1
- `limit` - целое число от 1 до 100, по умолчанию 20
- вычисляемый `offset = (page - 1) * limit` не должен превышать 10000

Некорректные параметры пагинации возвращают - `400 BAD_REQUEST`
Остальные ошибки валидации параметров списка возвращают - `422`

Фильтрация, сортировка и пагинация выполняются в PostgreSQL

`/api/equipment` и `/api/requests` возвращают массив `data`
и метаданные пагинации `meta`

`/api/equipment/:id/requests` сохраняет формат `{ "data": [...] }`
без `meta`, но возвращает только запрошенную страницу
Без параметров возвращаются первые 20 заявок оборудования

Вложенный список заявок поддерживает фильтры: 

- `status`
- `priority`
- `createdFrom`
- `createdTo`
- `sortBy` - сортировка
- `order` - направление

Допустимые значения `sortBy`: 

`createdAt`
`updatedAt`
`plannedAt`
`priority`
`status`

Допустимые значения `order`: 

`asc`
`desc`

Оборудование определяется параметром `:id` в URL:
параметр `equipmentId` в query не позволяет получить заявки другого  оборудования

Для отсутствующего или удалённого оборудования возвращается `404`

## Миграции: откат и восстановление

```bash
npm run db:migrate:status
npm run db:migrate:undo
npm run db:migrate
```

Для полного цикла используйте отдельную одноразовую БД: 

down-all удаляет таблицы и данные

```bash
# Для подготовленной одноразовой БД, например equipment_maintenance_review
DB_NAME=equipment_maintenance_review npm run db:setup-role
DB_NAME=equipment_maintenance_review npm run db:migrate
DB_NAME=equipment_maintenance_review npm run db:seed
DB_NAME=equipment_maintenance_review npm run db:migrate:undo:all
DB_NAME=equipment_maintenance_review npm run db:migrate
DB_NAME=equipment_maintenance_review npm run db:seed
```

Создать такую БД можно администратором в psql 
`CREATE DATABASE equipment_maintenance_review;`

Для сохранения пользовательских записей

```bash
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > maintenance.backup
```

Восстановление в новую пустую БД с тем же владельцем выполняется через pg_restore;
имя целевой БД задаётся явно

Например, после `CREATE DATABASE equipment_maintenance_restore;`:

```bash
docker compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d equipment_maintenance_restore --exit-on-error' < maintenance.backup
```

## Тестовая БД

Jest использует `equipment_maintenance_test` 

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

Сиды для тестов не нужны: fixtures создаются тестами

## Postman

Коллекция: `docs/postman/Equipment-maintenance-api.postman_collection.json`.

1. Установите `baseUrl=http://localhost:3000`
2. Выполните login и передавайте access token через Authorization - Bearer Token
3. Создайте оборудование и заявку, обновите UUID в переменных
4. Для проверки бригад используйте отдельную новую заявку и специалистов из сидов
5. Для auth откройте папку `Case 4 - Authentication`
6. Проверьте register - login - me - refresh - old refresh `401` - logout - me `401`
7. Проверьте login с ролью admin и негативные сценарии

### Переменные Postman

| Переменная | Назначение                                                             |
| --- |------------------------------------------------------------------------|
| `baseUrl` | Адрес API: `http://localhost:3000`                                     |
| `equipmentId` | ID оборудования, сохраняется после создания                            |
| `maintenanceRequestId` | ID заявки, сохраняется после создания                                  |
| `assigneeRequestId` | ID отдельной заявки для проверки назначений                            |
| `leadTechnicianId` | ID lead                                                                |
| `memberTechnicianId` | ID member в бригаде                                                    |
| `equipmentWithPassportId` | ID оборудования с паспортом                                            |
| `equipmentWithoutPassportId` | ID оборудования без паспорта                                           |
| `siteId` | ID площадки для проверки сводки                                        |
| `equipmentRequestsId` | ID оборудования для проверки вложенного списка заявок                  |
| `firstEquipmentRequestId` | ID первой заявки, сохраняется при проверке пагинации                   |
| `requestWithoutAssigneesId` | ID заявки без назначенных исполнителей                                 |
| `authEmail` | Email тестового пользователя для регистрации и входа                   |
| `authPassword` | Пароль тестового пользователя                                          |
| `authAccessToken` | Access token для запросов с Bearer аутентификацией                     |
| `authRefreshToken` | Текущий refresh token для обновления и завершения сессии               |
| `authOldRefreshToken` | Предыдущий refresh token для проверки запрета повторного использования |
| `authAdminEmail` | Email администратора, созданного через bootstrap                       |
| `authAdminPassword` | Пароль администратора                                                  |
| `referenceSiteId` | ID площадки для проверки CRUD |
| `referenceTechnicianId` | ID специалиста для проверки CRUD |

Переменные задаются на уровне коллекции

Коллекция содержит негативные сценарии для:

-   `400` - malformed JSON
-   `422` - ошибка валидации
-   `404` - Not Found
-   `409` - дублирование серийного номера
-   `409` - удаление оборудования с открытой заявкой
-   `409` - недопустимая замена статуса
-   `429` - превышение rate limit

### Проверка 429 превышение rate limit в Postman

Для ускоренной ручной проверки можно временно уменьшить лимит:

``` dotenv
RATE_LIMIT_MAX=3
RATE_LIMIT_WINDOW_MS=60000
```

После изменения `.env` перезапустите сервер и отправьте несколько запросов к `/api`

Запрос сверх лимита вернёт `429`

Некоторые запросы коллекции зависят от сущностей, созданных предыдущими запросами

### Площадки и специалисты

| Метод | Маршрут | Назначение | Доступ |
| --- | --- | --- | --- |
| GET | `/api/sites` | Список площадок | Все роли |
| GET | `/api/sites/:id` | Площадка по ID | Все роли |
| POST | `/api/sites` | Создание площадки | admin |
| PATCH | `/api/sites/:id` | Изменение площадки | admin |
| DELETE | `/api/sites/:id` | Удаление площадки | admin |
| GET | `/api/technicians` | Список специалистов | Все роли |
| GET | `/api/technicians/:id` | Специалист по ID | Все роли |
| POST | `/api/technicians` | Создание специалиста | admin |
| PATCH | `/api/technicians/:id` | Изменение специалиста | admin |
| DELETE | `/api/technicians/:id` | Удаление специалиста | admin |

Для всех маршрутов требуется Bearer токен

Повторный код площадки или номер специалиста - `409`

Удаление площадки, связанной с оборудованием, или специалиста, связанного с заявками либо пользователем, - `409`