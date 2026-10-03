# Развёртывание

## Стек

- Ubuntu 24.04, Docker Engine, Docker Compose
- Nginx - API - PostgreSQL
- HTTPS: Let's Encrypt, Certbot
- PostgreSQL доступна только внутри Docker сети
- Данные БД хранятся в томе `postgres_data`

## Подготовка

1. Направить A запись домена на IPv4 сервера
2. Установить Docker Engine, Compose, Git и Certbot
3. Разрешить входящие TCP 80, 443 и SSH
4. Клонировать репозиторий в `/opt/equipment-maintenance`
5. Скопировать `.env.example` в `.env`, выполнить `chmod 600 .env`
6. Задать отдельные пароли БД, JWT и данные администратора

Параметры серверного `.env`:

| Переменная | Значение |
| --- | --- |
| `HTTP_PORT` | `80` |
| `CORS_ORIGINS` | `https://equipment-maintenance-api.online` |
| `DB_HOST` | `db` |
| `DB_PORT` | `5432` |
| `DB_NAME` | Совпадает с `POSTGRES_DB` |
| `DB_USER` | Отдельная роль приложения, не `POSTGRES_USER` |
| `LOG_LEVEL` | `info` |

## Первый запуск

До запуска Nginx получить сертификат:

```bash
certbot certonly --standalone \
  --cert-name equipment-maintenance-api.online \
  -d equipment-maintenance-api.online
```

Запустить стек из каталога проекта:

```bash
mkdir -p /var/www/certbot
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d --build
```

Сервис `init` настраивает роль БД, применяет миграции, загружает демонстрационные данные и создаёт администратора
При повторном запуске существующий пароль администратора не меняется

Для другого домена изменить `deploy/nginx/https.conf`, пути сертификата и `CORS_ORIGINS`

## Продление сертификата

Переключить проверку домена на работающий Nginx:

```bash
certbot reconfigure \
  --cert-name equipment-maintenance-api.online \
  --authenticator webroot \
  --webroot-path /var/www/certbot
```

Создать `/etc/letsencrypt/renewal-hooks/deploy/reload-equipment-nginx.sh`:

```sh
#!/bin/sh
set -eu

cd /opt/equipment-maintenance
/usr/bin/docker compose -f docker-compose.yml -f docker-compose.https.yml exec -T nginx nginx -t
/usr/bin/docker compose -f docker-compose.yml -f docker-compose.https.yml exec -T nginx nginx -s reload
```

Включить выполнение и проверить продление:

```bash
chmod 750 /etc/letsencrypt/renewal-hooks/deploy/reload-equipment-nginx.sh
systemctl enable --now certbot.timer
certbot renew --cert-name equipment-maintenance-api.online --dry-run --run-deploy-hooks
```

## Проверка

```bash
docker compose -f docker-compose.yml -f docker-compose.https.yml ps -a
curl -I http://equipment-maintenance-api.online
curl -fsS https://equipment-maintenance-api.online/api/health/ready
```

- `db`, `api`: healthy; `init`: Exited (0); `nginx`: Up
- HTTP: `308` на HTTPS
- Readiness: `200`, `{"status":"ready"}`
- UI: вход, загрузка заявок, восстановление сессии после обновления, выход

## Обновление

Из каталога проекта, в выбранной ветке:

```bash
git pull --ff-only
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d --build
```

## Остановка

```bash
docker compose -f docker-compose.yml -f docker-compose.https.yml down
```

Том БД сохраняется. Флаг `-v` удаляет данные

## Локальная разработка

Открыть PostgreSQL для запуска приложения и тестов на компьютере:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
```

В локальном `.env`: `DB_HOST=127.0.0.1`, `DB_PORT=5433` при стандартном `POSTGRES_PORT`