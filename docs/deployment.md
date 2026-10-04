# Развёртывание и эксплуатация

## Сервер

- Ubuntu 24.04, Git, Docker Engine с Compose, Certbot, apache2-utils
- Входящие порты: SSH, TCP 80 и 443
- A-запись `equipment-maintenance-api.online` указывает на сервер
- Команды выполняются от root
- Запуск на произвольном устройстве без изменения конфигурации - по README

Проверить инструменты и DNS:

```bash
docker --version
docker compose version
certbot --version
getent ahostsv4 equipment-maintenance-api.online
```

## Подготовка проекта

```bash
git clone https://github.com/ilia-kravtsov/equipment-maintenance-api.git /opt/equipment-maintenance
cd /opt/equipment-maintenance
cp .env.example .env
chmod 600 .env
```

Заполнить секреты из README. Для сервера установить:

| Переменная | Значение |
| --- | --- |
| `HTTP_PORT` | `80` |
| `CORS_ORIGINS` | `https://equipment-maintenance-api.online` |
| `DB_NAME` | Совпадает с `POSTGRES_DB` |
| `LOG_LEVEL` | `info` |

Compose самостоятельно задаёт API значения `DB_HOST=db`, `DB_PORT=5432`, `TRUST_PROXY=1`

Создать Basic Auth для Grafana:

```bash
install -d -m 755 /etc/equipment-maintenance
htpasswd -c /etc/equipment-maintenance/grafana.htpasswd monitoring
chmod 644 /etc/equipment-maintenance/grafana.htpasswd
```

Пароль для `monitoring` вводится интерактивно

Это отдельная учётная запись, не администратор приложения и не пользователь Grafana

## Сертификат и первый запуск

До первого запуска Nginx порт 80 должен быть свободен:

```bash
certbot certonly --standalone \
  --cert-name equipment-maintenance-api.online \
  -d equipment-maintenance-api.online
```

Запустить весь стек:

```bash
mkdir -p /var/www/certbot
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.https.yml ps -a
```

`init` создаёт роли, применяет миграции, загружает сиды и создаёт администратора

| Сервис | Ожидаемое состояние |
| --- | --- |
| `db`, `api`, `prometheus`, `grafana` | healthy |
| `init` | Exited (0) |
| `nginx` | Up |

Проверить:

```bash
curl -I http://equipment-maintenance-api.online
curl -fsS https://equipment-maintenance-api.online/api/health/live
curl -fsS https://equipment-maintenance-api.online/api/health/ready
```

Ожидается: 

HTTP - `308`

live - `{"status":"ok"}`

ready - `{"status":"ready"}`

| Ресурс | Адрес |
| --- | --- |
| Приложение | https://equipment-maintenance-api.online/ |
| Swagger | https://equipment-maintenance-api.online/api/docs/ |
| Спецификация | https://equipment-maintenance-api.online/openapi.json |
| Grafana | https://equipment-maintenance-api.online/grafana/ |

Для Grafana: сначала Basic Auth `monitoring`, затем учётные данные `GRAFANA_ADMIN_*`

## Продление сертификата

После запуска Nginx переключить Certbot на webroot:

```bash
certbot reconfigure \
  --cert-name equipment-maintenance-api.online \
  --authenticator webroot \
  --webroot-path /var/www/certbot
```

Создать hook:

```bash
mkdir -p /etc/letsencrypt/renewal-hooks/deploy

cat > /etc/letsencrypt/renewal-hooks/deploy/reload-equipment-nginx.sh <<'EOF'
#!/bin/sh
set -eu

cd /opt/equipment-maintenance
/usr/bin/docker compose -f docker-compose.yml -f docker-compose.https.yml exec -T nginx nginx -t
/usr/bin/docker compose -f docker-compose.yml -f docker-compose.https.yml exec -T nginx nginx -s reload
EOF

chmod 750 /etc/letsencrypt/renewal-hooks/deploy/reload-equipment-nginx.sh
systemctl enable --now certbot.timer
certbot renew --cert-name equipment-maintenance-api.online --dry-run --run-deploy-hooks
```

## Рабочие команды

В следующих разделах команды выполняются из каталога проекта

Сокращение действует только в текущем Bash сеансе:

```bash
cd /opt/equipment-maintenance

dc() {
  docker compose -f docker-compose.yml -f docker-compose.https.yml "$@"
}
```

Обновление выбранной ветки:

```bash
git pull --ff-only
dc up -d --build
dc ps -a
curl -fsS https://equipment-maintenance-api.online/api/health/ready
```

Перед обновлением с изменением схемы БД создать резервную копию

Остановка с сохранением данных:

```bash
dc down
```

Не добавлять `-v`: этот флаг удаляет тома данных

## Логи и метрики

```bash
dc logs --tail=100 api nginx
dc logs --tail=100 db init
dc logs --tail=100 prometheus grafana
dc logs -f --tail=100 api
```

Ошибку API искать по `requestId` из ответа

Метрики внутри сети:

```bash
dc exec -T api node -e 'fetch("http://localhost:3000/metrics").then(r => r.text()).then(console.log)'
```

Доступность цели Prometheus:

```bash
dc exec -T prometheus wget -qO- 'http://localhost:9090/api/v1/query?query=up'
```

`up{job="equipment-api"} = 1` - сбор метрик работает

В Grafana доступны дашборды: 

Обслуживание - прикладные показатели
API - технические показатели

Alert rules находятся в разделе Alerting

## Типовые отказы

### Недоступна БД

Признаки: readiness `503`, ошибки соединения в логах API. Liveness может оставаться `200`

```bash
dc ps -a db api
dc logs --tail=100 db api
df -h
```

- Если БД остановлена: `dc up -d db`
- Изменение `POSTGRES_PASSWORD` не меняет пароль в уже созданном томе
- При нехватке места сначала освободить диск
- После устранения причины проверить readiness и запрос к API
- API восстанавливает соединение без перезапуска

### Рост доли 5xx

- Проверить технический дашборд: ошибки, RPS, p95
- Проверить readiness и логи `api`, `nginx`, `db`
- `502` от Nginx - проверить доступность и состояние API

### Переполнение диска

```bash
df -h
df -i
docker system df
journalctl --disk-usage
```

- Проверить рост Docker-логов, резервных копий и томов
- Перенести старые резервные копии на другое хранилище
- Удалять только проверенные ненужные образы и файлы
- Не выполнять очистку Docker с `--volumes`
- Не удалять файлы PostgreSQL вручную
- После освобождения места проверить БД, readiness и Grafana

Prometheus ограничен хранением за 7 дней и размером 1 GB, остальные данные требуют контроля места

### Перезапуск Nginx

```bash
dc logs --tail=100 nginx
dc run --rm --no-deps nginx nginx -t
```

Проверить синтаксис, сертификаты и файл Basic Auth. После исправления:

```bash
dc up -d --no-deps --force-recreate nginx
```

## Резервная копия БД

```bash
install -d -m 700 backups
backup_file="backups/database-$(date -u +%Y%m%dT%H%M%SZ).dump"

dc exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup_file"
chmod 600 "$backup_file"
test -s "$backup_file"
```

Проверить читаемость архива:

```bash
dc exec -T db pg_restore --list < "$backup_file"
```

Копию хранить отдельно от сервера

## Откат последней миграции

1. Остановить API и Grafana
2. Создать резервную копию по инструкции выше
3. Проверить список миграций и откатить последнюю

```bash
dc stop api grafana
```

После резервного копирования:

```bash
dc run --rm --no-deps init node dist/database/scripts/migrate.js status
dc run --rm --no-deps init node dist/database/scripts/migrate.js down
dc run --rm --no-deps init node dist/database/scripts/migrate.js status
```

Подготовить версию приложения, совместимую с полученной схемой:

```bash
git switch --detach <коммит>
dc build api
dc up -d --no-deps api grafana
```

Проверить readiness и основные операции

Не запускать обычный `up` со всеми зависимостями сразу после отката: 

`init` может повторно применить отменённую миграцию

`down-all` на рабочей БД не использовать

При необратимой потере данных потребуется восстановление резервной копии