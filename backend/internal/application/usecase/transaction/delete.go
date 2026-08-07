package transaction

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
)

// DeleteUseCase remove um lancamento do usuario.
type DeleteUseCase struct {
	transactions repository.TransactionRepository
}

// NewDeleteUseCase monta o caso de uso.
func NewDeleteUseCase(transactions repository.TransactionRepository) *DeleteUseCase {
	return &DeleteUseCase{transactions: transactions}
}

// Execute apaga o lancamento, desde que pertenca ao usuario.
func (uc *DeleteUseCase) Execute(ctx context.Context, userID, transactionID uuid.UUID) error {
	return uc.transactions.Delete(ctx, userID, transactionID)
}
