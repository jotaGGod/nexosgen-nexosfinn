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
		})

		external.Group(func(write chi.Router) {
			write.Use(middleware.RequireScope(vo.ScopeWriteTransactions, deps.Logger))
			write.Post("/transactions", deps.External.CreateTransaction)
			write.Put("/transactions/{id}", deps.External.UpdateTransaction)
		})

		external.Group(func(balance chi.Router) {
			balance.Use(middleware.RequireScope(vo.ScopeReadBalance, deps.Logger))
			balance.Get("/balance", deps.External.GetBalance)
			balance.Get("/accounts", deps.External.ListAccounts)
		})

		external.Group(func(categories chi.Router) {
			categories.Use(middleware.RequireScope(vo.ScopeReadCategories, deps.Logger))
			categories.Get("/categories", deps.External.ListCategories)
		})
	})
}
