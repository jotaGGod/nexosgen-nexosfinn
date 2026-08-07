package goal

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/service"
)

// Filtros aceitos pela listagem de metas.
const (
	FilterAll        = "all"
	FilterInProgress = "in_progress"
	FilterCompleted  = "completed"
)

// ListUseCase devolve as metas do usuario com o progresso calculado.
type ListUseCase struct {
	goals repository.GoalRepository
}

// NewListUseCase monta o caso de uso.
func NewListUseCase(goals repository.GoalRepository) *ListUseCase {
	return &ListUseCase{goals: goals}
}

// Execute lista as metas aplicando o filtro das abas "Todas / Em andamento /
// Concluidas".
func (uc *ListUseCase) Execute(ctx context.Context, userID uuid.UUID, filter string, includeArchived bool) ([]dto.GoalOutput, error) {
	found, err := uc.goals.ListByUser(ctx, userID, includeArchived)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	items := make([]dto.GoalOutput, 0, len(found))
	for _, item := range found {
		progress := service.CalculateGoalProgress(item, now)

		switch filter {
		case FilterInProgress:
			if progress.Completed {
				continue
			}
		case FilterCompleted:
			if !progress.Completed {
				continue
			}
		}

		items = append(items, dto.ToGoalOutput(item, progress))
	}
	return items, nil
}
