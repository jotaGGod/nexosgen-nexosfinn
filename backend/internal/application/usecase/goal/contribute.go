package goal

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/service"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

// ContributeUseCase registra um aporte em uma meta.
type ContributeUseCase struct {
	goals repository.GoalRepository
}

// NewContributeUseCase monta o caso de uso.
func NewContributeUseCase(goals repository.GoalRepository) *ContributeUseCase {
	return &ContributeUseCase{goals: goals}
}

// Execute soma o aporte ao valor acumulado da meta.
func (uc *ContributeUseCase) Execute(ctx context.Context, userID, goalID uuid.UUID, input dto.ContributeGoalInput) (*dto.GoalOutput, error) {
	if input.Amount == 0 {
		return nil, domainerr.InvalidInput("invalid_amount", "valor do aporte deve ser diferente de zero")
	}

	amount, err := vo.NewMoneyFromReais(input.Amount)
	if err != nil {
		return nil, err
	}

	existing, err := uc.goals.FindByID(ctx, userID, goalID)
	if err != nil {
		return nil, err
	}

	if err := existing.Contribute(amount); err != nil {
		return nil, err
	}

	if err := uc.goals.Update(ctx, existing); err != nil {
		return nil, err
	}

	output := dto.ToGoalOutput(existing, service.CalculateGoalProgress(existing, time.Now().UTC()))
	return &output, nil
}
