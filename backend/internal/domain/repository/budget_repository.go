package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
)

// BudgetRepository persiste orcamentos mensais por categoria.
type BudgetRepository interface {
	Create(ctx context.Context, budget *entity.Budget) error
	Update(ctx context.Context, budget *entity.Budget) error
	Delete(ctx context.Context, userID, id uuid.UUID) error
	FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Budget, error)
	FindByCategoryAndMonth(ctx context.Context, userID, categoryID uuid.UUID, month time.Time) (*entity.Budget, error)
	ListByMonth(ctx context.Context, userID uuid.UUID, month time.Time) ([]*entity.Budget, error)
}
