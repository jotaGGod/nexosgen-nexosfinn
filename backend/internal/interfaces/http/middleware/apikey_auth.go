package middleware

import (
	"context"
	"log/slog"
	"net/http"
	"strings"

	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/apikey"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/presenter"
)

// APIKeyAuthenticator resolve a identidade a partir do segredo apresentado.
type APIKeyAuthenticator interface {
	Execute(ctx context.Context, plainKey string) (*apikey.Identity, error)
}

// APIKeyAuth protege as rotas /api/v1/external, consumidas por automacoes.
//
// E deliberadamente separado do middleware JWT: a sessao web e a integracao
// externa tem ciclos de vida, formas de revogacao e permissoes diferentes, e
// misturar as duas em um so middleware acabaria permitindo que um token de
// navegador acessasse a superficie de automacao (ou o contrario).
func APIKeyAuth(authenticator APIKeyAuthenticator, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			plainKey := apiKeyFromRequest(r)
			if plainKey == "" {
				presenter.Error(r.Context(), w, logger, domainerr.Unauthorized(
					"api_key_required",
					"informe a chave em 'Authorization: Bearer <api_key>' ou no cabecalho 'X-API-Key'",
				))
				return
			}

			identity, err := authenticator.Execute(r.Context(), plainKey)
			if err != nil {
				presenter.Error(r.Context(), w, logger, err)
				return
			}

			ctx := WithUserID(r.Context(), identity.UserID)
			ctx = WithScopes(ctx, identity.Scopes)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireScope barra a requisicao quando a chave nao concede o escopo pedido.
func RequireScope(scope vo.Scope, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			for _, granted := range Scopes(r.Context()) {
				if granted == scope {
					next.ServeHTTP(w, r)
					return
				}
			}

			presenter.Error(r.Context(), w, logger, domainerr.Forbidden(
				"insufficient_scope",
				"esta chave de API nao possui o escopo '"+scope.String()+"'",
			))
		})
	}
}

// apiKeyFromRequest aceita as duas convencoes usuais.
//
// O n8n manda credenciais em "Authorization: Bearer" por padrao, mas varios
// nos HTTP simples so permitem cabecalhos customizados — suportar X-API-Key
// evita atrito na configuracao do workflow.
func apiKeyFromRequest(r *http.Request) string {
	if header := strings.TrimSpace(r.Header.Get("X-API-Key")); header != "" {
		return header
	}
	return bearerToken(r)
}
