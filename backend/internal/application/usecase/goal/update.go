package goal

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	"github.com/jacks/finapp/backend/internal/domain/service"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
	"github.com/jacks/finapp/backend/pkg/validator"
)

// UpdateUseCase altera uma meta existente.
type UpdateUseCase struct {
	goals repository.GoalRepository
}

// NewUpdateUseCase monta o caso de uso.
func NewUpdateUseCase(goals repository.GoalRepository) *UpdateUseCase {
	return &UpdateUseCase{goals: goals}
}

// Execute valida e aplica as alteracoes na meta.
func (uc *UpdateUseCase) Execute(ctx context.Context, userID, goalID uuid.UUID, input dto.UpdateGoalInput) (*dto.GoalOutput, error) {
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

	existing, err := uc.goals.FindByID(ctx, userID, goalID)
	if err != nil {
		return nil, err
	}

	if err := existing.Update(input.Name, targetAmount, currentAmount, deadline, input.ImageURL, input.Icon, input.Color); err != nil {
		return nil, err
	}
	existing.Archived = input.Archived

	if err := uc.goals.Update(ctx, existing); err != nil {
		return nil, err
	}

	output := dto.ToGoalOutput(existing, service.CalculateGoalProgress(existing, time.Now().UTC()))
	return &output, nil
}
