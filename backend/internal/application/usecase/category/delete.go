package category

import (
	"context"

	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
)

// DeleteUseCase remove uma categoria sem uso.
type DeleteUseCase struct {
	categories repository.CategoryRepository
}

// NewDeleteUseCase monta o caso de uso.
func NewDeleteUseCase(categories repository.CategoryRepository) *DeleteUseCase {
	return &DeleteUseCase{categories: categories}
}

// Execute apaga a categoria, ou orienta o arquivamento quando ela ja possui
// lancamentos — apagar destruiria o historico de relatorios do usuario.
func (uc *DeleteUseCase) Execute(ctx context.Context, userID, categoryID uuid.UUID) error {
	if _, err := uc.categories.FindByID(ctx, userID, categoryID); err != nil {
		return err
	}

	used, err := uc.categories.CountTransactions(ctx, userID, categoryID)
	if err != nil {
		return err
	}
	if used > 0 {
		return domainerr.Conflict(
			"category_in_use",
			"esta categoria possui lancamentos; arquive-a em vez de excluir",
		)
	}

	return uc.categories.Delete(ctx, userID, categoryID)
}
