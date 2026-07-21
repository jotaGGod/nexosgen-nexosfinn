package middleware

import (
	"net/http"

	"github.com/go-chi/cors"
)

// CORS libera o frontend a conversar com a API.
//
// As origens vem da configuracao: em desenvolvimento e http://localhost:3000,
// em producao seria o dominio da aplicacao. Nunca "*", porque a API trabalha
// com credenciais.
func CORS(allowedOrigins []string) func(http.Handler) http.Handler {
	return cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-API-Key", "X-Request-ID"},
		ExposedHeaders:   []string{"X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	})
}
