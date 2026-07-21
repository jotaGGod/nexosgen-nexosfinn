package budget

import (
	"context"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/domain/repository"
)

// DeleteUseCase remove um orcamento.
type DeleteUseCase struct {
	budgets repository.BudgetRepository
}

// NewDeleteUseCase monta o caso de uso.
func NewDeleteUseCase(budgets repository.BudgetRepository) *DeleteUseCase {
	return &DeleteUseCase{budgets: budgets}
}

// Execute apaga o orcamento do usuario.
func (uc *DeleteUseCase) Execute(ctx context.Context, userID, budgetID uuid.UUID) error {
	return uc.budgets.Delete(ctx, userID, budgetID)
}
