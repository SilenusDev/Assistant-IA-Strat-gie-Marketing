SHELL := /bin/bash

PROJECT_NAME := ai-marketing-assistant
COMPOSE_FILE := podman-compose.yml

.PHONY: help dev down logs backend-shell frontend-shell seed-db lint format test pytest npmt

help:
	@echo "Available targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'

dev: ## Build and start all services in detached mode
	podman-compose -f $(COMPOSE_FILE) up --build -d

down: ## Stop and remove all services
	podman-compose -f $(COMPOSE_FILE) down

logs: ## Tail logs for all services
	podman-compose -f $(COMPOSE_FILE) logs -f

backend-shell: ## Open a shell inside the backend container
	podman-compose -f $(COMPOSE_FILE) exec backend /bin/bash

frontend-shell: ## Open a shell inside the frontend container
	podman-compose -f $(COMPOSE_FILE) exec frontend /bin/bash

seed-db: ## Run the seed script inside the backend container
	podman-compose -f $(COMPOSE_FILE) exec backend python -m scripts.seed

lint: ## Run linters for backend and frontend
	podman-compose -f $(COMPOSE_FILE) exec backend make lint
	podman-compose -f $(COMPOSE_FILE) exec frontend npm run lint

format: ## Run formatters for backend and frontend
	podman-compose -f $(COMPOSE_FILE) exec backend make format
	podman-compose -f $(COMPOSE_FILE) exec frontend npm run format

test: ## Run all tests (backend + frontend)
	podman-compose -f $(COMPOSE_FILE) exec backend pytest
	podman-compose -f $(COMPOSE_FILE) exec frontend npm test
