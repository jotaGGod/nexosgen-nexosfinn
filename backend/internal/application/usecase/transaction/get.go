package transaction

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
)

// GetUseCase carrega um lancamento especifico.
type GetUseCase struct {
	transactions repository.TransactionRepository
	categories   repository.CategoryRepository
	accounts     repository.AccountRepository
}

// NewGetUseCase monta o caso de uso com suas dependencias.
func NewGetUseCase(
	transactions repository.TransactionRepository,
	categories repository.CategoryRepository,
	accounts repository.AccountRepository,
) *GetUseCase {
	return &GetUseCase{transactions: transactions, categories: categories, accounts: accounts}
}

// Execute devolve o lancamento com categoria e conta resolvidas.
func (uc *GetUseCase) Execute(ctx context.Context, userID, transactionID uuid.UUID) (*dto.TransactionOutput, error) {
	found, err := uc.transactions.FindByID(ctx, userID, transactionID)
	if err != nil {
		return nil, err
	}

	category, err := uc.categories.FindByID(ctx, userID, found.CategoryID)
	if err != nil {
		return nil, err
	}
	account, err := uc.accounts.FindByID(ctx, userID, found.AccountID)
	if err != nil {
		return nil, err
	}

	output := dto.ToTransactionOutput(found, category, account)
	return &output, nil
}
