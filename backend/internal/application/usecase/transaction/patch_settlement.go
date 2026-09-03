package transaction

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
)

// PatchSettlementUseCase altera somente a liquidação, sem transformar PATCH
// em um CRUD genérico parcial e sem deixar regras de domínio no handler HTTP.
type PatchSettlementUseCase struct {
	transactions repository.TransactionRepository
	categories   repository.CategoryRepository
	accounts     repository.AccountRepository
}

func NewPatchSettlementUseCase(transactions repository.TransactionRepository, categories repository.CategoryRepository, accounts repository.AccountRepository) *PatchSettlementUseCase {
	return &PatchSettlementUseCase{transactions: transactions, categories: categories, accounts: accounts}
}

func (uc *PatchSettlementUseCase) Execute(ctx context.Context, userID, transactionID uuid.UUID, input dto.PatchTransactionInput) (*dto.TransactionOutput, error) {
	existing, err := uc.transactions.FindByID(ctx, userID, transactionID)
	if err != nil {
		return nil, err
	}

	isSettled, settledAt, err := resolveSettlement(existing.Type, input.IsPaid, input.IsReceived, input.SettledAt)
	if err != nil {
		return nil, err
	}
	existing.SetSettlement(isSettled, settledAt)
	if err := uc.transactions.Update(ctx, existing); err != nil {
		return nil, err
	}

	category, err := uc.categories.FindByID(ctx, userID, existing.CategoryID)
	if err != nil {
		return nil, err
	}
	account, err := uc.accounts.FindByID(ctx, userID, existing.AccountID)
	if err != nil {
		return nil, err
	}
	output := dto.ToTransactionOutput(existing, category, account)
	return &output, nil
}
