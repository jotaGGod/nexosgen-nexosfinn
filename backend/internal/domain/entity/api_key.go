package entity

import (
	"time"

	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

// APIKey e a credencial usada por automacoes externas para falar com a API
// do nexosgen-nexosfinn sem passar pelo fluxo de login da web.
//
// Foi desenhada para o cenario de um workflow n8n conectado ao WhatsApp: o
// usuario gera a chave em Configuracoes > Integracoes e a cola no n8n. O
// segredo em texto puro existe apenas no instante da criacao — o que fica
// persistido e o hash (KeyHash) mais um prefixo legivel (Prefix) para que a
// chave possa ser identificada na listagem.
type APIKey struct {
	ID         uuid.UUID
	UserID     uuid.UUID
	Name       string
	Prefix     string
	KeyHash    string
	Scopes     []vo.Scope
	ExpiresAt  *time.Time
	RevokedAt  *time.Time
	LastUsedAt *time.Time
	CreatedAt  time.Time
}

// NewAPIKey cria uma chave validada. O par prefixo/hash e produzido pela
// infraestrutura (internal/infrastructure/apikey).
func NewAPIKey(userID uuid.UUID, name, prefix, keyHash string, scopes []vo.Scope, expiresAt *time.Time) (*APIKey, error) {
	normalizedName, err := normalizeName(name, "name", "nome da chave")
	if err != nil {
		return nil, err
	}

	if prefix == "" || keyHash == "" {
		return nil, domainerr.Internal("chave de API gerada de forma incompleta", nil)
	}

	if len(scopes) == 0 {
		scopes = vo.AllScopes()
	}
	for _, scope := range scopes {
		if !scope.IsValid() {
			return nil, domainerr.InvalidInput("invalid_scope", "escopo desconhecido: "+scope.String())
		}
	}

	if expiresAt != nil && !expiresAt.After(time.Now().UTC()) {
		return nil, domainerr.InvalidInput("invalid_expiration", "a data de expiracao deve estar no futuro")
	}

	return &APIKey{
		ID:        uuid.New(),
		UserID:    userID,
		Name:      normalizedName,
		Prefix:    prefix,
		KeyHash:   keyHash,
		Scopes:    scopes,
		ExpiresAt: expiresAt,
		CreatedAt: time.Now().UTC(),
	}, nil
}

// IsRevoked reporta se a chave foi revogada pelo usuario.
func (k *APIKey) IsRevoked() bool { return k.RevokedAt != nil }

// IsExpired reporta se a chave passou da data de expiracao.
func (k *APIKey) IsExpired(now time.Time) bool {
	return k.ExpiresAt != nil && !k.ExpiresAt.After(now)
}

// IsActive reporta se a chave pode autenticar uma requisicao.
func (k *APIKey) IsActive(now time.Time) bool { return !k.IsRevoked() && !k.IsExpired(now) }

// HasScope reporta se a chave concede o escopo pedido.
func (k *APIKey) HasScope(scope vo.Scope) bool {
	for _, granted := range k.Scopes {
		if granted == scope {
			return true
		}
	}
	return false
}

// Revoke invalida a chave de forma permanente.
func (k *APIKey) Revoke(now time.Time) error {
	if k.IsRevoked() {
		return domainerr.Conflict("api_key_already_revoked", "esta chave ja foi revogada")
	}
	revokedAt := now.UTC()
	k.RevokedAt = &revokedAt
	return nil
}

// MarkUsed registra o instante do ultimo uso da chave.
func (k *APIKey) MarkUsed(now time.Time) {
	usedAt := now.UTC()
	k.LastUsedAt = &usedAt
}

// Status descreve o estado da chave para exibicao na interface.
func (k *APIKey) Status(now time.Time) string {
	switch {
	case k.IsRevoked():
		return "revoked"
	case k.IsExpired(now):
		return "expired"
	default:
		return "active"
	}
}
