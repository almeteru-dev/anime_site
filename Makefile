BINARY_NAME=lycoris_server
FRONTEND_DIR=./frontend
BACKEND_DIR=./backend

# Добавил новые команды в .PHONY
.PHONY: all install dev dev-back dev-front dev-all build build-back build-front client-build client server prod clean setup-env nginx

all: install build

install: setup-env
	cd $(BACKEND_DIR) && go mod download && go mod tidy && go mod vendor
	cd $(FRONTEND_DIR) && npm install

setup-env:
	@if [ ! -f $(BACKEND_DIR)/.env ]; then \
		cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env; \
	fi

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
	rm -f $(BINARY_NAME)
	rm -rf $(FRONTEND_DIR)/.next
	rm -rf $(FRONTEND_DIR)/out
