package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
)

// APIKeyRepository persiste as credenciais de integracao externa.
type APIKeyRepository interface {
	Create(ctx context.Context, key *entity.APIKey) error
	ListByUser(ctx context.Context, userID uuid.UUID) ([]*entity.APIKey, error)
	FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.APIKey, error)

	// FindByHash localiza a chave a partir do hash do segredo apresentado na
	// requisicao. E o unico caminho de autenticacao por API Key.
	FindByHash(ctx context.Context, keyHash string) (*entity.APIKey, error)

	Revoke(ctx context.Context, key *entity.APIKey) error
	TouchLastUsed(ctx context.Context, key *entity.APIKey) error
}
