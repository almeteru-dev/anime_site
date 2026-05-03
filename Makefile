BINARY_NAME=lycoris_server
FRONTEND_DIR=./frontend
BACKEND_DIR=./backend

.PHONY: all install dev dev-back dev-front build build-back build-front clean

all: install build

install:
	cd $(BACKEND_DIR) && go mod download && go mod tidy && go mod vendor
	cd $(FRONTEND_DIR) && npm install

dev-back:
	cd $(BACKEND_DIR) && go run ./cmd/api

dev-front:
	cd $(FRONTEND_DIR) && npm run dev

dev:
	$(MAKE) -j 2 dev-back dev-front

build: build-back build-front

build-back:
	cd $(BACKEND_DIR) && go build -mod=vendor -o ../$(BINARY_NAME) ./cmd/api

build-front:
	cd $(FRONTEND_DIR) && npm run build

clean:
	rm -f $(BINARY_NAME)
	rm -rf $(FRONTEND_DIR)/.next
	rm -rf $(FRONTEND_DIR)/out
