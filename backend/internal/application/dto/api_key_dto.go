package dto

import (
	"time"

	"github.com/jacks/finapp/backend/internal/domain/entity"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// CreateAPIKeyInput e o payload de geracao de uma chave de integracao.
type CreateAPIKeyInput struct {
	Name      string   `json:"name"`
	Scopes    []string `json:"scopes"`
	ExpiresAt string   `json:"expires_at"`
}

// APIKeyOutput e a projecao segura da chave: expoe apenas o prefixo, nunca o
// segredo nem o hash.
type APIKeyOutput struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	Prefix     string   `json:"prefix"`
	Scopes     []string `json:"scopes"`
	Status     string   `json:"status"`
	ExpiresAt  string   `json:"expires_at"`
	LastUsedAt string   `json:"last_used_at"`
	CreatedAt  string   `json:"created_at"`
}

// CreateAPIKeyOutput acompanha o segredo em texto puro.
//
// Este e o unico ponto de toda a aplicacao em que PlainKey existe: ele nao e
// persistido nem pode ser recuperado depois, por isso a interface avisa o
// usuario para copiar a chave no ato.
type CreateAPIKeyOutput struct {
	APIKey   APIKeyOutput `json:"api_key"`
	PlainKey string       `json:"plain_key"`
}

// ToAPIKeyOutput serializa a chave para listagem.
func ToAPIKeyOutput(key *entity.APIKey, now time.Time) APIKeyOutput {
	return APIKeyOutput{
		ID:         key.ID.String(),
		Name:       key.Name,
		Prefix:     key.Prefix,
		Scopes:     vo.ScopesToStrings(key.Scopes),
		Status:     key.Status(now),
		ExpiresAt:  formatTimestamp(key.ExpiresAt),
		LastUsedAt: formatTimestamp(key.LastUsedAt),
		CreatedAt:  key.CreatedAt.Format(time.RFC3339),
	}
}

func formatTimestamp(t *time.Time) string {
	if t == nil {
		return ""
	}
	return t.Format(time.RFC3339)
}
