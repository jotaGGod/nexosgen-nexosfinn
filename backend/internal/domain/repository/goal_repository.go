package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
)

// GoalRepository persiste metas financeiras.
type GoalRepository interface {
	Create(ctx context.Context, goal *entity.Goal) error
	Update(ctx context.Context, goal *entity.Goal) error
	Delete(ctx context.Context, userID, id uuid.UUID) error
	FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Goal, error)
	ListByUser(ctx context.Context, userID uuid.UUID, includeArchived bool) ([]*entity.Goal, error)
}
