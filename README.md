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

Важно про порты и TLS:

- Этот проект поднимается через Docker и публикует контейнерный nginx на порт `8081` хоста (в `docker-compose.yml` это `8081:80`).
- HTTPS лучше делать на хосте (nginx/caddy/traefik) или через Cloudflare, а потом проксировать на `http://127.0.0.1:8081`.
- Поэтому при домене используй `make up` (порт `8081`), а `make up80` не используй, если на хосте уже есть nginx/caddy на `80/443`.

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

Остановить Docker не нужно — host nginx/caddy/Cloudflare будет просто проксировать на уже запущенный порт `8081`.

Если ты случайно запускал `make up80` и порт `80` занят, останови compose и подними обратно на `8081`:

```bash
docker compose down
make up
```

Если у тебя TLS терминируется на хосте (nginx/caddy/traefik) или домен за Cloudflare, это значит:

- Снаружи пользователи заходят на `https://your-domain`.
- HTTPS “заканчивается” на хостовом прокси.
- Дальше прокси пересылает запросы во внутренний порт контейнерного nginx (который слушает `8081`).

Что делать на практике:

1) Убедись, что Docker-версия поднята и слушает локально `8081` на сервере:

```bash
make up
curl -i http://127.0.0.1:8081/api/ping
```

2) Настрой reverse-proxy на хосте так, чтобы он принимал домен на `80/443` и проксировал на `127.0.0.1:8081`.

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

Если этот вариант не используешь, можно публиковать контейнерный nginx на `80:80` (см. ниже в README), но тогда host nginx/caddy не должен занимать `:80`, и HTTPS у тебя не появится.

### TLS (HTTPS) на домене: подробно

HTTPS можно сделать двумя способами:

1) TLS на хосте (рекомендуется): host nginx/caddy/traefik принимает `:443` и проксирует на контейнерный nginx `127.0.0.1:8081`.
2) TLS внутри Docker (сложнее): контейнер сам получает сертификат и слушает `:443`.

Ниже — пошагово вариант 1 (самый простой в поддержке).

#### Шаг 0: DNS и порты

- DNS: `A` запись `your-domain` → IP твоего VPS.
- Открой порты на VPS:
  - обязательно `80/tcp` (нужно Let’s Encrypt для выдачи/продления)
  - обязательно `443/tcp` (сам HTTPS)

Если на сервере уже крутится nginx/apache и занимает `80/443`, нужно либо отключить их, либо использовать их как прокси.

#### Если домен за Cloudflare

Cloudflare добавляет второй участок TLS: браузер → Cloudflare и Cloudflare → твой VPS.

Рекомендуемые настройки в Cloudflare:

- `SSL/TLS` → режим `Full (strict)`
- `SSL/TLS` → `Edge Certificates` → включи `Always Use HTTPS` (по желанию)

Дальше есть два нормальных варианта на VPS. Проект при этом всё равно поднимается на `127.0.0.1:8081`, а TLS делается на хосте.

##### Вариант CF-1 (рекомендуется с Cloudflare): Cloudflare Origin Certificate + nginx на хосте

Этот вариант не требует Let’s Encrypt и обычно самый стабильный, когда домен проксируется через Cloudflare.

1) В Cloudflare создай Origin Certificate:

- `SSL/TLS` → `Origin Server` → `Create Certificate`
- Сохрани два блока: сертификат (cert) и приватный ключ (key)

2) На VPS поставь nginx (если ещё нет):

```bash
sudo apt update
sudo apt install -y nginx
```

3) На VPS создай папку под сертификаты и положи файлы:

```bash
sudo mkdir -p /etc/ssl/cloudflare
sudo nano /etc/ssl/cloudflare/origin.pem
sudo nano /etc/ssl/cloudflare/origin.key
sudo chmod 600 /etc/ssl/cloudflare/origin.key
```

4) В корне репозитория подними проект (это создаст `backend/.env.docker`, если нет) и запусти Docker:

```bash
cd ~/Program/anime_site
make install
make up
curl -i http://127.0.0.1:8081/api/ping
```

5) Настрой nginx на хосте как reverse-proxy + TLS.

Создай конфиг (на VPS):

```bash
sudo nano /etc/nginx/sites-available/lycorislib
```

Пример:

```nginx
server {
  listen 443 ssl http2;
  server_name your-domain;

  ssl_certificate     /etc/ssl/cloudflare/origin.pem;
  ssl_certificate_key /etc/ssl/cloudflare/origin.key;

  location / {
    proxy_pass http://127.0.0.1:8081;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}

server {
  listen 80;
  server_name your-domain;
  return 301 https://$host$request_uri;
}
```

Включи сайт и перезагрузи nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/lycorislib /etc/nginx/sites-enabled/lycorislib
sudo nginx -t
sudo systemctl reload nginx
```

6) В Cloudflare убедись, что режим `Full (strict)` включён. Проверка:

- `https://your-domain/api/ping` должен отдавать `200`.

Важно: Origin Certificate валиден только для соединения Cloudflare → VPS. Это нормально.

##### Вариант CF-2: Let’s Encrypt на хосте (Caddy или nginx+certbot)

Можно использовать инструкции ниже (Caddy / nginx+certbot). Если Cloudflare проксирует домен (оранжевое облако), иногда проще временно выключить проксирование на время выдачи сертификата или использовать DNS-01.

#### Вариант A: Caddy (сам выдаёт и продлевает сертификаты)

1) Останови/убери сервисы, которые держат `80/443` (если есть).

2) Установи Caddy (Ubuntu):

```bash
sudo apt update
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

3) Подними проект в Docker на `8081`:

```bash
make up
curl -i http://127.0.0.1:8081/api/ping
```

4) Настрой Caddy как reverse-proxy.

Открой `/etc/caddy/Caddyfile` и добавь:

```caddy
your-domain {
  reverse_proxy 127.0.0.1:8081
}
```

Применить:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

5) Проверка:

- `https://your-domain/api/ping` должен отдавать `200`.

Где лежат сертификаты: Caddy хранит и обновляет их сам, руками обычно ничего делать не нужно.

#### Вариант B: nginx + certbot (Let’s Encrypt)

1) Установи nginx и certbot:

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

2) Подними проект в Docker на `8081`:

```bash
make up
curl -i http://127.0.0.1:8081/api/ping
```

3) Создай nginx конфиг reverse-proxy (HTTP), чтобы certbot смог пройти проверку домена.

Например файл `/etc/nginx/sites-available/lycorislib`:

```nginx
server {
  listen 80;
  server_name your-domain;

  location / {
    proxy_pass http://127.0.0.1:8081;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Включи сайт и перезагрузи nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/lycorislib /etc/nginx/sites-enabled/lycorislib
sudo nginx -t
sudo systemctl reload nginx
```

4) Получи сертификат и включи HTTPS:

```bash
sudo certbot --nginx -d your-domain
```

certbot сам добавит `listen 443 ssl;` и пути к сертификатам в nginx-конфиг.

5) Автопродление:

```bash
sudo systemctl status certbot.timer --no-pager
sudo certbot renew --dry-run
```

#### Env при HTTPS

Когда домен реально открывается по `https://`:

- `backend/.env.docker`:
  - `FRONTEND_URL=https://your-domain`
  - `BACKEND_URL=https://your-domain`
  - `ALLOWED_ORIGINS=https://your-domain`
  - `COOKIE_SECURE=auto` (станет `true` автоматически)

После смены env перезапусти:

```bash
docker compose up -d
```

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
