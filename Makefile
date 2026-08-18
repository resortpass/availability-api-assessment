.PHONY: help start stop build clean logs test migrate seed shell

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

start: ## Start all services (app + mock API)
	@touch dev.sqlite3
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "   Main API:  http://localhost:3000"
	@echo "   Mock API:  http://localhost:3001"
	@echo ""
	@echo "Run 'make logs' to view logs"

start-with-postgres: ## Start with PostgreSQL instead of SQLite
	@touch dev.sqlite3
	docker-compose --profile postgres up -d
	@echo "✅ Services started with PostgreSQL!"
	@echo "   Main API:   http://localhost:3000"
	@echo "   Mock API:   http://localhost:3001"
	@echo "   PostgreSQL: localhost:5432"

stop: ## Stop all services
	docker-compose down

build: ## Build Docker images
	docker-compose build

clean: ## Stop services and remove volumes
	docker-compose down -v
	rm -f dev.sqlite3

logs: ## View logs from all services
	docker-compose logs -f

logs-app: ## View logs from main app only
	docker-compose logs -f app

logs-mock: ## View logs from mock API only
	docker-compose logs -f mock-api

test: ## Run tests in Docker
	docker-compose exec app npm test

migrate-make: ## Create a new migration (usage: make migrate-make NAME=create_products)
	docker-compose exec app npm run migrate:make $(NAME)

migrate: ## Run migrations
	docker-compose exec app npm run migrate:latest

migrate-rollback: ## Rollback last migration
	docker-compose exec app npm run migrate:rollback

seed: ## Run database seeds
	docker-compose exec app npm run seed:run

shell: ## Open shell in app container
	docker-compose exec app sh

install: ## Install dependencies
	docker-compose exec app npm install

restart: ## Restart all services
	docker-compose restart

check: ## Check if services are running
	@echo "Checking services..."
	@curl -s http://localhost:3000/health > /dev/null && echo "✅ Main API is up" || echo "❌ Main API is down"
	@curl -s http://localhost:3001/api/services > /dev/null && echo "✅ Mock API is up" || echo "❌ Mock API is down"
