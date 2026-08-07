// Package router define a superficie HTTP da aplicacao.
package router

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/config"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/http/handler"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/http/middleware"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/presenter"
)

// Dependencies reune tudo que o roteador precisa.
//
// Os handlers ja chegam montados: o roteador nao constroi nada, so decide
// quem atende cada rota e sob qual middleware.
type Dependencies struct {
	Config *config.Config
	Logger *slog.Logger

	TokenVerifier       middleware.TokenVerifier
	APIKeyAuthenticator middleware.APIKeyAuthenticator

	Health      *handler.HealthHandler
	Auth        *handler.AuthHandler
	Transaction *handler.TransactionHandler
	Category    *handler.CategoryHandler
	Account     *handler.AccountHandler
	Goal        *handler.GoalHandler
	Budget      *handler.BudgetHandler
	Dashboard   *handler.DashboardHandler
	Report      *handler.ReportHandler
	APIKey      *handler.APIKeyHandler
	External    *handler.ExternalHandler

	// OpenAPIPath e o arquivo de especificacao servido em /docs.
	OpenAPIPath string
}

// New monta o roteador completo.
func New(deps Dependencies) http.Handler {
	router := chi.NewRouter()

	router.Use(middleware.RequestID)
	router.Use(middleware.Recover(deps.Logger))
	router.Use(middleware.Logger(deps.Logger))
	router.Use(middleware.CORS(deps.Config.CORSOrigins))

	router.NotFound(func(w http.ResponseWriter, r *http.Request) {
		presenter.JSON(w, http.StatusNotFound, presenter.ErrorResponse{
			Error: presenter.ErrorBody{Code: "route_not_found", Message: "rota nao encontrada"},
		})
	})
	router.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) {
		presenter.JSON(w, http.StatusMethodNotAllowed, presenter.ErrorResponse{
			Error: presenter.ErrorBody{Code: "method_not_allowed", Message: "metodo nao permitido para esta rota"},
		})
	})

	router.Get("/health/live", deps.Health.Live)
	router.Get("/health/ready", deps.Health.Ready)

	mountDocs(router, deps)

	router.Route("/api/v1", func(api chi.Router) {
		mountInternalRoutes(api, deps)
		mountExternalRoutes(api, deps)
	})

	return router
}
