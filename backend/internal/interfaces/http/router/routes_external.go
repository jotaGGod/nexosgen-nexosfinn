package router

import (
	"github.com/go-chi/chi/v5"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/http/middleware"
)

// mountExternalRoutes registra a superficie consumida por automacoes.
//
// Estas rotas existem para o cenario de integracao via n8n + WhatsApp descrito
// no handler externo. Elas sao autenticadas exclusivamente por API Key — um
// access token de navegador nao abre esta porta — e cada rota exige o escopo
// correspondente, para que uma chave de leitura nunca consiga escrever.
func mountExternalRoutes(api chi.Router, deps Dependencies) {
	api.Route("/external", func(external chi.Router) {
		external.Use(middleware.APIKeyAuth(deps.APIKeyAuthenticator, deps.Logger))

		external.Group(func(read chi.Router) {
			read.Use(middleware.RequireScope(vo.ScopeReadTransactions, deps.Logger))
			read.Get("/transactions", deps.External.ListTransactions)
			read.Get("/transactions/{id}", deps.External.GetTransaction)
		})

		external.Group(func(write chi.Router) {
			write.Use(middleware.RequireScope(vo.ScopeWriteTransactions, deps.Logger))
			write.Post("/transactions", deps.External.CreateTransaction)
			write.Put("/transactions/{id}", deps.External.UpdateTransaction)
			write.Patch("/transactions/{id}", deps.Transaction.PatchSettlement)
		})

		external.Group(func(remove chi.Router) {
			remove.Use(middleware.RequireScope(vo.ScopeDeleteTransactions, deps.Logger))
			remove.Delete("/transactions/{id}", deps.Transaction.Delete)
		})

		external.Group(func(balance chi.Router) {
			balance.Use(middleware.RequireScope(vo.ScopeReadBalance, deps.Logger))
			balance.Get("/balance", deps.External.GetBalance)
		})

		external.Group(func(categories chi.Router) {
			categories.Use(middleware.RequireScope(vo.ScopeReadCategories, deps.Logger))
			categories.Get("/categories", deps.External.ListCategories)
			categories.Get("/categories/{id}", deps.External.GetCategory)
		})

		external.Group(func(categories chi.Router) {
			categories.Use(middleware.RequireScope(vo.ScopeWriteCategories, deps.Logger))
			categories.Post("/categories", deps.Category.Create)
			categories.Put("/categories/{id}", deps.Category.Update)
		})
		external.Group(func(categories chi.Router) {
			categories.Use(middleware.RequireScope(vo.ScopeDeleteCategories, deps.Logger))
			categories.Delete("/categories/{id}", deps.Category.Delete)
		})

		external.Group(func(accounts chi.Router) {
			accounts.Use(middleware.RequireAnyScope([]vo.Scope{vo.ScopeReadAccounts, vo.ScopeReadBalance}, deps.Logger))
			accounts.Get("/accounts", deps.Account.List)
			accounts.Get("/accounts/{id}", deps.External.GetAccount)
		})
		external.Group(func(accounts chi.Router) {
			accounts.Use(middleware.RequireScope(vo.ScopeWriteAccounts, deps.Logger))
			accounts.Post("/accounts", deps.Account.Create)
			accounts.Put("/accounts/{id}", deps.Account.Update)
		})
		external.Group(func(accounts chi.Router) {
			accounts.Use(middleware.RequireScope(vo.ScopeDeleteAccounts, deps.Logger))
			accounts.Delete("/accounts/{id}", deps.Account.Delete)
		})

		external.Group(func(goals chi.Router) {
			goals.Use(middleware.RequireScope(vo.ScopeReadGoals, deps.Logger))
			goals.Get("/goals", deps.Goal.List)
			goals.Get("/goals/{id}", deps.External.GetGoal)
		})
		external.Group(func(goals chi.Router) {
			goals.Use(middleware.RequireScope(vo.ScopeWriteGoals, deps.Logger))
			goals.Post("/goals", deps.Goal.Create)
			goals.Put("/goals/{id}", deps.Goal.Update)
			goals.Post("/goals/{id}/contributions", deps.Goal.Contribute)
		})
		external.Group(func(goals chi.Router) {
			goals.Use(middleware.RequireScope(vo.ScopeDeleteGoals, deps.Logger))
			goals.Delete("/goals/{id}", deps.Goal.Delete)
		})

		external.Group(func(budgets chi.Router) {
			budgets.Use(middleware.RequireScope(vo.ScopeReadBudgets, deps.Logger))
			budgets.Get("/budgets", deps.Budget.List)
			budgets.Get("/budgets/{id}", deps.External.GetBudget)
		})
		external.Group(func(budgets chi.Router) {
			budgets.Use(middleware.RequireScope(vo.ScopeWriteBudgets, deps.Logger))
			budgets.Put("/budgets", deps.Budget.Upsert)
		})
		external.Group(func(budgets chi.Router) {
			budgets.Use(middleware.RequireScope(vo.ScopeDeleteBudgets, deps.Logger))
			budgets.Delete("/budgets/{id}", deps.Budget.Delete)
		})
	})
}
