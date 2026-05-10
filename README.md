# LycorisLib (Docker)

Полный запуск проекта через Docker Compose: отдельные контейнеры для **PostgreSQL**, **Go backend**, **Next.js frontend** и **nginx**.

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
