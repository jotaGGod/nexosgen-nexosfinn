package category

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

// ListUseCase devolve as categorias do usuario.
type ListUseCase struct {
	categories repository.CategoryRepository
}

// NewListUseCase monta o caso de uso.
func NewListUseCase(categories repository.CategoryRepository) *ListUseCase {
	return &ListUseCase{categories: categories}
}

// Execute lista as categorias, opcionalmente filtrando por tipo.
func (uc *ListUseCase) Execute(ctx context.Context, userID uuid.UUID, rawType string, includeArchived bool) ([]dto.CategoryOutput, error) {
	var categoryType *vo.TransactionType
	if rawType != "" {
		parsed, err := vo.ParseTransactionType(rawType)
		if err != nil {
			return nil, err
		}
		categoryType = &parsed
	}

	found, err := uc.categories.ListByUser(ctx, userID, categoryType, includeArchived)
	if err != nil {
		return nil, err
	}

	items := make([]dto.CategoryOutput, 0, len(found))
	for _, item := range found {
		items = append(items, dto.ToCategoryOutput(item))
	}
	return items, nil
}
