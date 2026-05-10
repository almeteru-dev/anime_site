# LycorisLib (Docker Edition)

Полный стек проекта в Docker: **PostgreSQL**, **Go API**, **Next.js Frontend** и **Nginx** (внутри контейнера).

## 🛠 1. Подготовка (Prerequisites)

На сервере должны быть установлены **Docker** и **Docker Compose**.
Для Ubuntu можно использовать готовую команду:

```bash
make docker-ubuntu

```

---

## 🚀 2. Быстрый запуск

### Шаг 1: Инициализация

Создает необходимые `.env` файлы из шаблонов.

```bash
make install

```

### Шаг 2: Настройка окружения

Отредактируй файл `backend/.env.docker`. Основные параметры:

| Переменная | Значение для Локалки | Значение для VPS |
| --- | --- | --- |
| **JWT_SECRET** | любая строка | длинная случайная строка |
| **FRONTEND_URL** | `http://localhost:8081` | `https://your-domain` |
| **BACKEND_URL** | `http://localhost:8081` | `https://your-domain` |
| **ALLOWED_ORIGINS** | `http://localhost:8081` | `https://your-domain` |
| **IS_PRODUCTION** | `false` | `true` |

### Шаг 3: Переменная для Frontend (SSR)

Создай файл `.env` в корне репозитория (рядом с `docker-compose.yml`):

```env
NEXT_PUBLIC_SITE_URL=https://your-domain

```

### Шаг 4: Запуск

```bash
make up  # Запуск на порту 8081 (рекомендуется)
# или
make up80 # Запуск напрямую на 80 порту (если хост пустой)

```

---

## 🔒 3. Настройка HTTPS (Production)

Самый стабильный вариант: **Host Proxy**. Docker слушает порт `8081`, а системный Nginx/Caddy на хосте принимает трафик на `80/443` и проксирует его внутрь.

### Вариант А: Cloudflare Origin (Рекомендуется)

Если домен за Cloudflare, это самый простой путь.

1. Создай **Origin Certificate** в панели Cloudflare.
2. Сохрани их на VPS: `/etc/ssl/cloudflare/origin.pem` и `origin.key`.
3. Настрой системный Nginx на хосте:

#### Создание конфига

Создай файл конфигурации (замени `lycoris` на имя своего проекта):

```bash
sudo nano /etc/nginx/sites-available/lycoris

```

#### Шаг 2: Настройка проксирования

Вставь следующий блок (для работы с **Cloudflare Origin Certificate**):

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

```

#### Шаг 3: Активация сайта

Выполни эти команды, чтобы Nginx увидел новый файл:

```bash
# 1. Создаем ссылку для активации
sudo ln -s /etc/nginx/sites-available/lycoris /etc/nginx/sites-enabled/

# 2. Проверяем на ошибки
sudo nginx -t

# 3. Перезапускаем сервис
sudo systemctl reload nginx

```


### Вариант Б: Certbot (Let's Encrypt)

Если Cloudflare не используется:

1. Установи Certbot: `sudo apt install certbot python3-certbot-nginx`.
2. Создай простой конфиг Nginx на порту 80 с `proxy_pass [http://127.0.0.1:8081](http://127.0.0.1:8081)`.
3. Запусти `sudo certbot --nginx -d your-domain`.

---

## 💻 4. Локальная разработка (без Docker)

Если нужно вносить правки в код с горячей перезагрузкой:

1. **Бэкенд**: Настрой `backend/.env` (база должна быть запущена).
2. **Фронтенд**: Настрой `frontend/.env.local`.
3. **Запуск**:
```bash
make dev

```


*Frontend: localhost:3000, API: localhost:8080*

---

## 💾 5. Обслуживание и Бэкапы

### Полезные команды

* `make ps` — статус контейнеров.
* `make logs` — просмотр логов в реальном времени.
* `make restart` — быстрый перезапуск сервисов.

### Работа с базой (PostgreSQL)

Бэкапы сохраняются в папку `backup/` в корне проекта.

* **Создать бэкап**:
```bash
make backup-db lycoris_db

```


* **Восстановить из бэкапа**:

```bash
  make restore-db lycoris_db BACKUP=backup/lycoris_db/YYYY-MM-DD_HH-MM-SS

```

```