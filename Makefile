.DEFAULT_GOAL := help

COMPOSE := docker compose

.PHONY: help
help: ## Lista os comandos disponiveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

.PHONY: up
up: ## Sobe toda a stack (Postgres, migrations, backend, frontend)
	$(COMPOSE) up -d --build

.PHONY: down
down: ## Derruba a stack mantendo os dados
	$(COMPOSE) down

.PHONY: reset
reset: ## Derruba a stack e apaga o volume do banco
	$(COMPOSE) down -v

.PHONY: logs
logs: ## Acompanha os logs de todos os servicos
	$(COMPOSE) logs -f

.PHONY: logs-backend
logs-backend: ## Acompanha os logs do backend
	$(COMPOSE) logs -f backend

.PHONY: ps
ps: ## Mostra o estado dos servicos
	$(COMPOSE) ps

.PHONY: seed
seed: ## Popula o banco com um usuario de demonstracao e dados realistas
	$(COMPOSE) exec backend /app/seed

.PHONY: migrate-up
migrate-up: ## Aplica as migrations pendentes
	$(COMPOSE) run --rm migrate

.PHONY: migrate-down
migrate-down: ## Desfaz a ultima migration
	$(COMPOSE) run --rm migrate -path=/migrations \
		-database=postgres://nexosgen_financehub:nexosgen_financehub@postgres:5432/nexosgen_financehub?sslmode=disable down 1

.PHONY: migrate-create
migrate-create: ## Cria uma migration: make migrate-create name=add_tags
	@test -n "$(name)" || (echo "informe o nome: make migrate-create name=add_tags" && exit 1)
	$(COMPOSE) run --rm --entrypoint migrate migrate create \
		-ext sql -dir /migrations -seq $(name)

.PHONY: test
test: ## Roda os testes do backend
	cd backend && go test ./...

.PHONY: test-cover
test-cover: ## Roda os testes com relatorio de cobertura
	cd backend && go test -cover ./internal/domain/... ./internal/application/...

.PHONY: lint
lint: ## Verifica formatacao e problemas estaticos no backend
	cd backend && gofmt -l . && go vet ./...

.PHONY: psql
psql: ## Abre um shell psql no banco
	$(COMPOSE) exec postgres psql -U nexosgen_financehub -d nexosgen_financehub
