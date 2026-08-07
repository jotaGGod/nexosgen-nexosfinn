package goal

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
)

// DeleteUseCase remove uma meta.
type DeleteUseCase struct {
	goals repository.GoalRepository
}

// NewDeleteUseCase monta o caso de uso.
func NewDeleteUseCase(goals repository.GoalRepository) *DeleteUseCase {
	return &DeleteUseCase{goals: goals}
}

// Execute apaga a meta do usuario.
func (uc *DeleteUseCase) Execute(ctx context.Context, userID, goalID uuid.UUID) error {
	return uc.goals.Delete(ctx, userID, goalID)
}
