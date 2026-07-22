package router

import (
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/jacks/finapp/backend/internal/interfaces/http/middleware"
)

// mountInternalRoutes registra a API consumida pela interface web.
//
// Tudo abaixo de /api/v1 (exceto /auth e /external) exige o access token JWT
// emitido no login.
func mountInternalRoutes(api chi.Router, deps Dependencies) {
	api.Route("/auth", func(auth chi.Router) {
		auth.Post("/register", deps.Auth.Register)
		auth.Post("/login", deps.Auth.Login)
		auth.Post("/refresh", deps.Auth.Refresh)
		auth.Post("/logout", deps.Auth.Logout)
	})

	api.Group(func(protected chi.Router) {
		protected.Use(middleware.JWTAuth(deps.TokenVerifier, deps.Logger))

		protected.Route("/me", func(me chi.Router) {
			me.Get("/", deps.Auth.Me)
			me.Put("/", deps.Auth.UpdateProfile)
			me.Put("/password", deps.Auth.ChangePassword)
			me.Delete("/financial-data", deps.Auth.ResetFinancialData)
		})

		protected.Route("/transactions", func(transactions chi.Router) {
			transactions.Get("/", deps.Transaction.List)
			transactions.Post("/", deps.Transaction.Create)
			transactions.Get("/{id}", deps.Transaction.Get)
			transactions.Put("/{id}", deps.Transaction.Update)
			transactions.Delete("/{id}", deps.Transaction.Delete)
		})

		protected.Route("/categories", func(categories chi.Router) {
			categories.Get("/", deps.Category.List)
			categories.Post("/", deps.Category.Create)
			categories.Put("/{id}", deps.Category.Update)
			categories.Delete("/{id}", deps.Category.Delete)
		})

		protected.Route("/accounts", func(accounts chi.Router) {
			accounts.Get("/", deps.Account.List)
			accounts.Post("/", deps.Account.Create)
			accounts.Put("/{id}", deps.Account.Update)
			accounts.Delete("/{id}", deps.Account.Delete)
		})

		protected.Route("/goals", func(goals chi.Router) {
			goals.Get("/", deps.Goal.List)
			goals.Post("/", deps.Goal.Create)
			goals.Put("/{id}", deps.Goal.Update)
			goals.Delete("/{id}", deps.Goal.Delete)
			goals.Post("/{id}/contributions", deps.Goal.Contribute)
		})

		protected.Route("/budgets", func(budgets chi.Router) {
			budgets.Get("/", deps.Budget.List)
			budgets.Put("/", deps.Budget.Upsert)
			budgets.Delete("/{id}", deps.Budget.Delete)
		})

		protected.Get("/dashboard", deps.Dashboard.Get)
		protected.Get("/reports", deps.Report.Get)

		protected.Route("/api-keys", func(keys chi.Router) {
			keys.Get("/", deps.APIKey.List)
			keys.Post("/", deps.APIKey.Create)
			keys.Delete("/{id}", deps.APIKey.Revoke)
		})
	})
}

// mountDocs publica a especificacao OpenAPI e um visualizador simples.
func mountDocs(router chi.Router, deps Dependencies) {
	router.Get("/docs/openapi.yaml", func(w http.ResponseWriter, r *http.Request) {
		spec, err := os.ReadFile(deps.OpenAPIPath)
		if err != nil {
			http.Error(w, "especificacao indisponivel", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
		_, _ = w.Write(spec)
	})

	router.Get("/docs", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte(swaggerPage))
	})
}

// swaggerPage carrega o Swagger UI apontando para a especificacao local.
// Os assets vem de CDN, entao a pagina precisa de internet — a especificacao
// em si continua acessivel offline em /docs/openapi.yaml.
const swaggerPage = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>FinApp API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => SwaggerUIBundle({ url: '/docs/openapi.yaml', dom_id: '#swagger' });
  </script>
</body>
</html>`
