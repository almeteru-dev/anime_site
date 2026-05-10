FRONTEND_DIR=./frontend
BACKEND_DIR=./backend
COMPOSE=docker compose

.PHONY: install up up80 down build logs ps restart clean docker-check setup-env port80-free

.PHONY: docker-ubuntu docker-ubintu

all: install build

install: docker-check setup-env

docker-check:
	@command -v docker >/dev/null 2>&1 || (echo "Docker is not installed. Install Docker Engine + Docker Compose first." && exit 1)
	@docker compose version >/dev/null 2>&1 || (echo "Docker Compose plugin is missing. Install docker compose plugin." && exit 1)

docker-ubuntu:
	@command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 && (echo "Docker Engine + Docker Compose already installed." && exit 0) || true
	sudo apt-get update
	sudo apt-get install -y ca-certificates curl gnupg
	sudo install -m 0755 -d /etc/apt/keyrings
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
	sudo chmod a+r /etc/apt/keyrings/docker.gpg
	echo "deb [arch=$$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $$(. /etc/os-release && echo $$VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
	sudo apt-get update
	sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
	sudo systemctl enable --now docker
	sudo usermod -aG docker $$USER || true
	@echo "Docker installed. IMPORTANT: group changes do not apply to the current terminal."
	@echo "Re-login, or run: newgrp docker (then re-run make up)."

docker-ubintu: docker-ubuntu

setup-env:
	@if [ ! -f $(BACKEND_DIR)/.env.docker ]; then \
		cp $(BACKEND_DIR)/.env.docker.example $(BACKEND_DIR)/.env.docker; \
		echo "Created $(BACKEND_DIR)/.env.docker from example."; \
	fi

up:
	$(COMPOSE) up -d --build

up80:
	$(COMPOSE) -f docker-compose.yml -f docker-compose.port80.yml up -d --build

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f --tail=200

ps:
	$(COMPOSE) ps

# --- DEVELOPMENT (Режим разработки) ---
dev-back:
	cd $(BACKEND_DIR) && go run ./cmd/api

dev-front:
	cd $(FRONTEND_DIR) && npm run dev

dev:
	$(MAKE) -j 2 dev-back dev-front

dev-all:
	@bash -c 'set -e; $(MAKE) dev-back & pid1=$$!; $(MAKE) dev-front & pid2=$$!; trap "kill $$pid1 $$pid2" INT TERM; wait $$pid1 $$pid2'

nginx:
	sudo cp ./nginx.conf.template /etc/nginx/sites-available/lycorislib
	sudo rm -f /etc/nginx/sites-enabled/default
	sudo ln -sf /etc/nginx/sites-available/lycorislib /etc/nginx/sites-enabled/lycorislib
	@grep -q "server_name localhost" ./nginx.conf.template || (echo "ERROR: server_name localhost missing in nginx.conf.template" && exit 1)
	@sudo systemctl stop apache2 >/dev/null 2>&1 || true
	@sudo service apache2 stop >/dev/null 2>&1 || true
	sudo nginx -t
	sudo systemctl reload nginx || sudo service nginx reload

# --- BUILD (Сборка проекта) ---
build: build-back build-front

build-back:
	cd $(BACKEND_DIR) && go build -mod=vendor -o ../$(BINARY_NAME) ./cmd/api

# Твоя команда для сборки фронта (ссылается на build-front)
client-build: build-front

build-front:
	cd $(FRONTEND_DIR) && npm run build

# --- PRODUCTION RUN (Запуск готового продукта) ---

# Твоя команда для запуска собранного фронта
client:
	cd $(FRONTEND_DIR) && npm run start

# Запуск скомпилированного бэкенда
server: build-back
	cd $(BACKEND_DIR) && ../$(BINARY_NAME)

# Запуск всего проекта в продакшн-режиме (одновременно)
prod: build
	$(MAKE) -j 2 server client

# --- CLEAN ---
clean:
	$(COMPOSE) down -v

port80-free:
	@sudo systemctl stop apache2 >/dev/null 2>&1 || true
	@sudo service apache2 stop >/dev/null 2>&1 || true
	@sudo systemctl stop nginx >/dev/null 2>&1 || true
	@sudo service nginx stop >/dev/null 2>&1 || true
	@echo "Stopped apache2/nginx if they were running. Port 80 should be free now."
