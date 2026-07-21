package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/domain/entity"
)

// AccountRepository persiste contas financeiras.
type AccountRepository interface {
	Create(ctx context.Context, account *entity.Account) error
	Update(ctx context.Context, account *entity.Account) error
	Delete(ctx context.Context, userID, id uuid.UUID) error
	FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Account, error)
	ListByUser(ctx context.Context, userID uuid.UUID, includeArchived bool) ([]*entity.Account, error)
	CountTransactions(ctx context.Context, userID, accountID uuid.UUID) (int, error)
}
