package apikey

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/domain/repository"
)

// RevokeUseCase invalida uma chave de integracao.
type RevokeUseCase struct {
	keys repository.APIKeyRepository
}

// NewRevokeUseCase monta o caso de uso.
func NewRevokeUseCase(keys repository.APIKeyRepository) *RevokeUseCase {
	return &RevokeUseCase{keys: keys}
}

// Execute revoga a chave em definitivo. Toda automacao que a estiver usando
// passa a receber 401 na proxima chamada.
func (uc *RevokeUseCase) Execute(ctx context.Context, userID, keyID uuid.UUID) error {
	key, err := uc.keys.FindByID(ctx, userID, keyID)
	if err != nil {
		return err
	}

	if err := key.Revoke(time.Now().UTC()); err != nil {
		return err
	}

	return uc.keys.Revoke(ctx, key)
}
