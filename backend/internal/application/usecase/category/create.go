// Package category reune os casos de uso de categorias de transacao.
package category

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-financehub/backend/pkg/validator"
)

// CreateUseCase cria uma categoria para o usuario.
type CreateUseCase struct {
	categories repository.CategoryRepository
}

// NewCreateUseCase monta o caso de uso.
func NewCreateUseCase(categories repository.CategoryRepository) *CreateUseCase {
	return &CreateUseCase{categories: categories}
}

// Execute valida e persiste a nova categoria.
func (uc *CreateUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.CreateCategoryInput) (*dto.CategoryOutput, error) {
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

	created, err := entity.NewCategory(userID, input.Name, categoryType, input.Color, input.Icon)
	if err != nil {
		return nil, err
	}

	if err := uc.categories.Create(ctx, created); err != nil {
		if domainerr.Is(err, domainerr.KindConflict) {
			return nil, domainerr.Conflict("category_already_exists", "ja existe uma categoria com este nome e tipo")
		}
		return nil, err
	}

	output := dto.ToCategoryOutput(created)
	return &output, nil
}
