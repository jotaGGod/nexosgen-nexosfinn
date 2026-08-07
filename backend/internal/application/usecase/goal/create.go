// Package goal reune os casos de uso de metas financeiras.
package goal

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/service"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-financehub/backend/pkg/validator"
)

// CreateUseCase cria uma meta financeira.
type CreateUseCase struct {
	goals repository.GoalRepository
}

// NewCreateUseCase monta o caso de uso.
func NewCreateUseCase(goals repository.GoalRepository) *CreateUseCase {
	return &CreateUseCase{goals: goals}
}

// Execute valida e persiste a nova meta, ja devolvendo o progresso calculado.
func (uc *CreateUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.CreateGoalInput) (*dto.GoalOutput, error) {
	v := validator.New()
	v.Required("name", input.Name, "nome")
	v.Positive("target_amount", input.TargetAmount, "valor alvo")
	v.NotNegative("current_amount", input.CurrentAmount, "valor acumulado")
	if err := v.Error(); err != nil {
		return nil, err
	}

	targetAmount, err := vo.NewMoneyFromReais(input.TargetAmount)
	if err != nil {
		return nil, err
	}
	currentAmount, err := vo.NewMoneyFromReais(input.CurrentAmount)
	if err != nil {
		return nil, err
	}

	deadline, err := dto.ParseOptionalDate(input.Deadline, "prazo")
	if err != nil {
		return nil, err
	}

	created, err := entity.NewGoal(userID, input.Name, targetAmount, currentAmount, deadline, input.ImageURL, input.Icon, input.Color)
	if err != nil {
		return nil, err
	}

	if err := uc.goals.Create(ctx, created); err != nil {
		return nil, err
	}

	output := dto.ToGoalOutput(created, service.CalculateGoalProgress(created, time.Now().UTC()))
	return &output, nil
}
