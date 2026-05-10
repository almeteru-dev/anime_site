# LycorisLib (Docker)

Полный запуск проекта через Docker Compose: отдельные контейнеры для **PostgreSQL**, **Go backend**, **Next.js frontend** и **nginx**.

## Быстрый старт: домен + Docker

### 1) Установка

```bash
make docker-ubuntu
make install
```

### 2) Настройка

Открой `backend/.env.docker` и выставь минимум:

- `JWT_SECRET=...` (обязательно)
- `IS_PRODUCTION=true`
- `FRONTEND_URL=https://your-domain`
- `BACKEND_URL=https://your-domain`
- `ALLOWED_ORIGINS=https://your-domain`
- `COOKIE_SECURE=auto`

И задай домен для фронта (для SSR/абсолютных URL):

```bash
export NEXT_PUBLIC_SITE_URL="https://your-domain"
```

Где это задавать:

- На сервере (хосте), в той же оболочке/сессии, где ты запускаешь Docker Compose. Это переменная окружения для `docker compose`, она подставится в `docker-compose.yml`.
- Если хочешь, чтобы оно сохранялось между перезагрузками:
  - добавь строку в `~/.profile` или `~/.bashrc`, либо
  - создай файл `.env` рядом с `docker-compose.yml` (в корне репозитория) и положи туда:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain
```

### 3) Запуск

```bash
make up
```

Если у тебя TLS терминируется на хосте (nginx/caddy/traefik), это значит:

- Снаружи пользователи заходят на `https://your-domain`.
- HTTPS “заканчивается” на хостовом прокси.
- Дальше прокси пересылает запросы во внутренний порт контейнерного nginx (который слушает `8081`).

Что делать на практике:

1) Убедись, что Docker-версия поднята и слушает локально `8081` на сервере:

```bash
make up
curl -i http://127.0.0.1:8081/api/ping
```

2) Настрой хостовый reverse-proxy так, чтобы он принимал домен и проксировал на `127.0.0.1:8081`.

Пример для nginx на хосте (схематично):

```nginx
server {
  listen 443 ssl;
  server_name your-domain;

  location / {
    proxy_pass http://127.0.0.1:8081;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Если этот вариант не используешь, можно публиковать контейнерный nginx на `80:80` (см. ниже в README), но это будет HTTP без TLS.

Автостарт после перезагрузки VPS:

- Убедись, что сервис Docker включён в автозапуск:

```bash
sudo systemctl enable --now docker
```

- Для контейнеров добавь политику перезапуска в `docker-compose.yml` (например `restart: unless-stopped` для `nginx`, `frontend`, `backend`, `db`). Тогда после рестарта Docker они поднимутся сами.

## Быстрый старт: локально + Docker

### 1) Установка

```bash
make docker-ubuntu
make install
```

### 2) Настройка

Открой `backend/.env.docker` и выставь:

- `JWT_SECRET=...`
- `FRONTEND_URL=http://localhost:8081`
- `BACKEND_URL=http://localhost:8081`
- `ALLOWED_ORIGINS=http://localhost:8081`
- `COOKIE_SECURE=auto`

### 3) Запуск

```bash
make up
```

Откроется:

- Сайт: `http://localhost:8081/`
- API: `http://localhost:8081/api/ping`

## Нужно ли ставить Docker самому?

Да. На машине должны быть установлены:

- Docker Engine
- Docker Compose (plugin `docker compose`)

На Ubuntu можно поставить одной командой:

```bash
make docker-ubuntu
```

## Быстрый старт (пошагово)

### 1) Подготовить env для Docker

```bash
make install
```

Команда проверит наличие Docker и создаст `backend/.env.docker` из примера, если файла ещё нет.

### 2) Настроить `backend/.env.docker`

Открой `backend/.env.docker` и обязательно поменяй:

- `JWT_SECRET`
- при необходимости `POSTGRES_PASSWORD` (см. `docker-compose.yml`) и `DB_PASSWORD`

Минимальный ориентир по переменным:

- `DB_HOST=db` (в Docker это имя сервиса Postgres)
- `DB_PASSWORD` должен совпадать с `POSTGRES_PASSWORD` в `docker-compose.yml`
- `DB_RESET=false` (не включать, иначе можешь потерять данные)

Про URL'ы:

- Если запускаешь по умолчанию (`make up`, порт **8081**), то:
  - `FRONTEND_URL=http://localhost:8081`
  - `BACKEND_URL=http://localhost:8081`
- Если запускаешь на порту 80 (`make up80`), то:
  - `FRONTEND_URL=http://localhost`
  - `BACKEND_URL=http://localhost`

Про CORS и cookie:

- `ALLOWED_ORIGINS` — список origin'ов браузера, которым разрешено ходить в API с cookie.
  - Для Docker на локалке это обычно тот же адрес, что и сайт (например `http://localhost:8081`).
- `COOKIE_SECURE=auto` — Secure включается только если `FRONTEND_URL` начинается с `https://`.
  - Это важно: при `http://...` браузер игнорирует `Secure` cookie.

### 3) Запуск

```bash
make up
```

После запуска:

- Сайт: `http://localhost:8081/`
- API: `http://localhost:8081/api/`

Если хочешь именно порт 80 (без `:8081`):

```bash
make port80-free
make up80
```

### 4) Логи / остановка

```bash
make logs
make down
```

## nginx конфиг

Docker nginx конфиг лежит в `nginx/nginx.conf` и уже проксирует:

- `/api/` → `backend:8080`
- `/` → `frontend:3000`

Тебе не нужно отдельно настраивать системный nginx на хосте — nginx работает внутри Docker.
Конфликт с Apache/nginx на хосте возможен только из-за порта 80 (см. `make up80`).

## Локальная разработка (без Docker)

### 1) Backend env

- Скопируй `backend/.env.example` → `backend/.env`
- Базово для локалки:
  - `IS_PRODUCTION=false`
  - `FRONTEND_URL=http://localhost:3000`
  - `BACKEND_URL=http://localhost:8080`
  - `ALLOWED_ORIGINS=` можно не задавать (по умолчанию возьмётся `FRONTEND_URL` и `http://localhost:3000`)
  - `COOKIE_SECURE=auto` (для http будет `false`)

### 2) Frontend env

- Если нужно, создай `frontend/.env.local` (или экспортируй переменные окружения) и укажи:
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
  - `BACKEND_API_URL=http://localhost:8080/api`

### 3) Запуск

```bash
make dev
```

После запуска:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api/ping`

Важно: фронт в браузере ходит на `"/api"` и полагается на proxy/rewrites в Next. В dev режиме это работает из коробки.

## Запуск на своём домене

- DNS: создай `A`/`AAAA` запись домена на публичный IP сервера.
- Снаружи обычно открывают только `80`/`443` (без `:порт` в URL). Порты в compose нужны, чтобы пробросить контейнер на хост.

### Вариант A (рекомендуется): TLS на хосте, приложение за прокси

Схема: `https://your-domain` (host nginx/caddy/traefik) → `http://127.0.0.1:8081` (контейнерный nginx) → frontend/backend.

- На сервере запускай Docker так же, как локально: `make up` (наружу будет слушать `:8081`).
- На хостовом nginx/caddy настрой `server_name your-domain` и proxy_pass на `127.0.0.1:8081`.

Env:

- `backend/.env.docker`:
  - `IS_PRODUCTION=true`
  - `FRONTEND_URL=https://your-domain`
  - `BACKEND_URL=https://your-domain`
  - `ALLOWED_ORIGINS=https://your-domain`
  - `COOKIE_SECURE=auto` (станет `true` из-за https)
  - `COOKIE_SAMESITE=lax` (если фронт и API на одном домене — обычно достаточно)
- `docker-compose.yml` / переменная окружения:
  - `NEXT_PUBLIC_SITE_URL=https://your-domain`

### Вариант B: публиковать контейнерный nginx на 80

Схема: `http://your-domain` → контейнерный nginx (`80:80`).

- Запуск:

```bash
make port80-free
NEXT_PUBLIC_SITE_URL=http://your-domain make up80
```

Важно: при `http://...` `COOKIE_SECURE=auto` выключит `Secure` (это корректно), но это не HTTPS.

### Если фронт и API на разных доменах/сабдоменах

- Тогда чаще всего нужен `COOKIE_SAMESITE=none` и обязательно HTTPS.
- `COOKIE_DOMAIN` можно выставлять, например `.your-domain` для шаринга cookie между сабдоменами.

## Проверка после запуска

- Открой сайт: `http://localhost:8081/`
- Проверь API: `http://localhost:8081/api/ping`

Если используешь порт 80 (через `make up80`), убери `:8081`.

## Полезные команды

```bash
make ps
make restart
make build
make clean
```

## Backup базы (в самом конце)

Бэкапы хранятся в `backup/<db_name>/<backup_date>/` в корне репозитория. Это удобно, если в будущем появится несколько баз.

Сделать бэкап:

```bash
make backup-db <db_name>
```

Пример:

```bash
make backup-db animevista
```

Результат:

- `backup/animevista/YYYY-MM-DD_HH-MM-SS/animevista.dump` (custom format, для восстановления)
- `backup/animevista/YYYY-MM-DD_HH-MM-SS/animevista.sql` (plain SQL, удобно посмотреть)

Восстановить в Postgres внутри Docker:

```bash
make restore-db <db_name> BACKUP=backup/<db_name>/YYYY-MM-DD_HH-MM-SS
```

Пример:

```bash
make restore-db animevista BACKUP=backup/animevista/2026-05-10_12-34-56
```

Переезд на другой VPS:

- Скопируй нужную папку `backup/<db_name>/YYYY-MM-DD_HH-MM-SS` на новый сервер.
- Подними проект `make up` (чтобы Postgres контейнер был запущен).
- Выполни `make restore-db <db_name> BACKUP=...`.
