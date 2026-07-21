package middleware

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/google/uuid"
	domainerr "github.com/jacks/finapp/backend/internal/domain/errors"
	"github.com/jacks/finapp/backend/internal/interfaces/presenter"
)

// TokenVerifier valida o access token da sessao web.
//
// A interface e declarada aqui, no consumidor: o middleware nao importa a
// infraestrutura, ele recebe uma implementacao pronta no wiring.
type TokenVerifier interface {
	ParseAccessToken(token string) (uuid.UUID, error)
}

// JWTAuth exige um access token valido e injeta o usuario no contexto.
func JWTAuth(verifier TokenVerifier, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := bearerToken(r)
			if token == "" {
				presenter.Error(r.Context(), w, logger,
					domainerr.Unauthorized("missing_token", "autenticacao necessaria"))
				return
			}

			userID, err := verifier.ParseAccessToken(token)
			if err != nil {
				presenter.Error(r.Context(), w, logger, err)
				return
			}

			next.ServeHTTP(w, r.WithContext(WithUserID(r.Context(), userID)))
		})
	}
}

// bearerToken extrai o token do cabecalho Authorization.
func bearerToken(r *http.Request) string {
	header := strings.TrimSpace(r.Header.Get("Authorization"))
	if header == "" {
		return ""
	}

	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return ""
	}
	return strings.TrimSpace(parts[1])
}
