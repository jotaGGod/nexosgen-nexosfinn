package account

import (
	"context"

	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
)

// DeleteUseCase remove uma conta sem movimento.
type DeleteUseCase struct {
	accounts repository.AccountRepository
}

// NewDeleteUseCase monta o caso de uso.
func NewDeleteUseCase(accounts repository.AccountRepository) *DeleteUseCase {
	return &DeleteUseCase{accounts: accounts}
}

// Execute apaga a conta, ou orienta o arquivamento quando ela ja possui
// lancamentos.
func (uc *DeleteUseCase) Execute(ctx context.Context, userID, accountID uuid.UUID) error {
	if _, err := uc.accounts.FindByID(ctx, userID, accountID); err != nil {
		return err
	}

	used, err := uc.accounts.CountTransactions(ctx, userID, accountID)
	if err != nil {
		return err
	}
	if used > 0 {
		return domainerr.Conflict(
			"account_in_use",
			"esta conta possui lancamentos; arquive-a em vez de excluir",
		)
	}

	return uc.accounts.Delete(ctx, userID, accountID)
}
