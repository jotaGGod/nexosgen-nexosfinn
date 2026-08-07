package category

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-financehub/backend/pkg/validator"
)

// UpdateUseCase altera uma categoria existente.
type UpdateUseCase struct {
	categories repository.CategoryRepository
}

// NewUpdateUseCase monta o caso de uso.
func NewUpdateUseCase(categories repository.CategoryRepository) *UpdateUseCase {
	return &UpdateUseCase{categories: categories}
}

// Execute valida e aplica as alteracoes.
func (uc *UpdateUseCase) Execute(ctx context.Context, userID, categoryID uuid.UUID, input dto.UpdateCategoryInput) (*dto.CategoryOutput, error) {
	v := validator.New()
	v.Required("name", input.Name, "nome")
	v.Required("type", input.Type, "tipo")
	if err := v.Error(); err != nil {
		return nil, err
	}

	categoryType, err := vo.ParseTransactionType(input.Type)
	if err != nil {
		return nil, err
	}

	existing, err := uc.categories.FindByID(ctx, userID, categoryID)
	if err != nil {
		return nil, err
	}

	// Trocar o tipo de uma categoria ja usada inverteria o sinal de
	// lancamentos historicos, entao a mudanca so e permitida enquanto a
	// categoria estiver sem uso.
	if existing.Type != categoryType {
		used, err := uc.categories.CountTransactions(ctx, userID, categoryID)
		if err != nil {
			return nil, err
		}
		if used > 0 {
			return nil, domainerr.Conflict(
				"category_type_locked",
				"nao e possivel trocar o tipo de uma categoria que ja possui lancamentos",
			)
		}
	}

	if err := existing.Update(input.Name, categoryType, input.Color, input.Icon); err != nil {
		return nil, err
	}
	if input.Archived {
		existing.Archive()
	} else {
		existing.Archived = false
	}

	if err := uc.categories.Update(ctx, existing); err != nil {
		if domainerr.Is(err, domainerr.KindConflict) {
			return nil, domainerr.Conflict("category_already_exists", "ja existe uma categoria com este nome e tipo")
		}
		return nil, err
	}

	output := dto.ToCategoryOutput(existing)
	return &output, nil
}
