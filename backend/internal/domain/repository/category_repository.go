package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

// CategoryRepository persiste categorias de transacao.
type CategoryRepository interface {
	Create(ctx context.Context, category *entity.Category) error
	Update(ctx context.Context, category *entity.Category) error
	Delete(ctx context.Context, userID, id uuid.UUID) error
	FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Category, error)
	ListByUser(ctx context.Context, userID uuid.UUID, categoryType *vo.TransactionType, includeArchived bool) ([]*entity.Category, error)
	CountTransactions(ctx context.Context, userID, categoryID uuid.UUID) (int, error)
}
