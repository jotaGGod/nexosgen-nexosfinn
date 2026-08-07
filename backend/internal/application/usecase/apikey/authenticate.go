package apikey

import (
	"context"
	"log/slog"
	"strings"
	"time"

	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

// Identity e o resultado de uma autenticacao por API Key.
type Identity struct {
	UserID uuid.UUID
	KeyID  uuid.UUID
	Scopes []vo.Scope
}

// HasScope reporta se a chave concede o escopo pedido.
func (i Identity) HasScope(scope vo.Scope) bool {
	for _, granted := range i.Scopes {
		if granted == scope {
			return true
		}
	}
	return false
}

// AuthenticateUseCase valida a chave apresentada em uma requisicao externa.
//
// E o caso de uso consumido pelo middleware de API Key: manter a regra aqui
// (e nao no middleware) mantem a camada HTTP sem decisao de autorizacao.
type AuthenticateUseCase struct {
	keys      repository.APIKeyRepository
	generator Generator
	logger    *slog.Logger
}

// NewAuthenticateUseCase monta o caso de uso com suas dependencias.
func NewAuthenticateUseCase(keys repository.APIKeyRepository, generator Generator, logger *slog.Logger) *AuthenticateUseCase {
	return &AuthenticateUseCase{keys: keys, generator: generator, logger: logger}
}

// Execute resolve a identidade a partir do segredo apresentado.
func (uc *AuthenticateUseCase) Execute(ctx context.Context, plainKey string) (*Identity, error) {
	invalidKey := domainerr.Unauthorized("invalid_api_key", "chave de API invalida ou revogada")

	plainKey = strings.TrimSpace(plainKey)
	if plainKey == "" {
		return nil, domainerr.Unauthorized("api_key_required", "chave de API nao informada")
	}

	key, err := uc.keys.FindByHash(ctx, uc.generator.Hash(plainKey))
	if err != nil {
		if domainerr.Is(err, domainerr.KindNotFound) {
			return nil, invalidKey
		}
		return nil, err
	}

	now := time.Now().UTC()
	if !key.IsActive(now) {
		return nil, invalidKey
	}

	// O registro de ultimo uso e conveniencia de auditoria, exibida na tela de
	// integracoes; falhar aqui nao pode derrubar a requisicao.
	key.MarkUsed(now)
	if err := uc.keys.TouchLastUsed(ctx, key); err != nil {
		uc.logger.WarnContext(ctx, "falha ao registrar uso da chave de API",
			slog.String("api_key_id", key.ID.String()), slog.Any("error", err))
	}

	return &Identity{UserID: key.UserID, KeyID: key.ID, Scopes: key.Scopes}, nil
}
