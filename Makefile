BINARY_NAME=lycoris_server
FRONTEND_DIR=./frontend
BACKEND_DIR=./backend

# Добавил новые команды в .PHONY
.PHONY: all install dev dev-back dev-front build build-back build-front client-build client server prod clean setup-env

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
server:
	cd $(BACKEND_DIR) && ../$(BINARY_NAME)

# Запуск всего проекта в продакшн-режиме (одновременно)
prod:
	$(MAKE) -j 2 server client

# --- CLEAN ---
clean:
	rm -f $(BINARY_NAME)
	rm -rf $(FRONTEND_DIR)/.next
	rm -rf $(FRONTEND_DIR)/out
