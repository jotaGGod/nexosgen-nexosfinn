package apikey

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/domain/repository"
)

// ListUseCase devolve as chaves do usuario.
type ListUseCase struct {
	keys repository.APIKeyRepository
}

// NewListUseCase monta o caso de uso.
func NewListUseCase(keys repository.APIKeyRepository) *ListUseCase {
	return &ListUseCase{keys: keys}
}

// Execute lista as chaves, sempre sem o segredo.
func (uc *ListUseCase) Execute(ctx context.Context, userID uuid.UUID) ([]dto.APIKeyOutput, error) {
	found, err := uc.keys.ListByUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	items := make([]dto.APIKeyOutput, 0, len(found))
	for _, key := range found {
		items = append(items, dto.ToAPIKeyOutput(key, now))
	}
	return items, nil
}
