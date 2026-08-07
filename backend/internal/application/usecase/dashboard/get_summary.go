package dashboard

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/parallel"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/service"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

// GetSummaryUseCase monta os quatro cards de metrica do topo do dashboard.
type GetSummaryUseCase struct {
	accounts  repository.AccountRepository
	analytics repository.TransactionAnalyticsRepository
}

// NewGetSummaryUseCase monta o caso de uso com suas dependencias.
func NewGetSummaryUseCase(
	accounts repository.AccountRepository,
	analytics repository.TransactionAnalyticsRepository,
) *GetSummaryUseCase {
	return &GetSummaryUseCase{accounts: accounts, analytics: analytics}
}

// Execute apura os totais do periodo e as variacoes contra o periodo anterior.
func (uc *GetSummaryUseCase) Execute(ctx context.Context, userID uuid.UUID, period vo.Period) (dto.DashboardSummaryOutput, error) {
	previousPeriod := period.Previous()

	var (
		current          repository.Totals
		previous         repository.Totals
		accountList      []*entity.Account
		netUntilNow      vo.Money
		netUntilPrevious vo.Money
	)

	err := parallel.Run(ctx,
		func(taskCtx context.Context) (taskErr error) {
			current, taskErr = uc.analytics.Totals(taskCtx, userID, period)
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			previous, taskErr = uc.analytics.Totals(taskCtx, userID, previousPeriod)
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			accountList, taskErr = uc.accounts.ListByUser(taskCtx, userID, false)
			return taskErr
		},
		// O saldo total e um acumulado, nao um total do periodo: ele considera
		// tudo que aconteceu ate a data final do recorte.
		func(taskCtx context.Context) (taskErr error) {
			netUntilNow, taskErr = uc.analytics.NetUntil(taskCtx, userID, period.End())
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			netUntilPrevious, taskErr = uc.analytics.NetUntil(taskCtx, userID, previousPeriod.End())
			return taskErr
		},
	)
	if err != nil {
		return dto.DashboardSummaryOutput{}, err
	}

	balance := service.TotalBalance(accountList, netUntilNow)
	previousBalance := service.TotalBalance(accountList, netUntilPrevious)

	savings := service.Savings(current.Income, current.Expense)
	previousSavings := service.Savings(previous.Income, previous.Expense)

	return dto.DashboardSummaryOutput{
		TotalBalance: metric(balance, previousBalance),
		Income:       metric(current.Income, previous.Income),
		Expense:      metric(current.Expense, previous.Expense),
		Savings:      metric(savings, previousSavings),
		SavingsRate:  service.SavingsRate(current.Income, current.Expense),
		Period:       dto.ToPeriodOutput(period),
	}, nil
}

func metric(current, previous vo.Money) dto.MetricOutput {
	return dto.MetricOutput{
		Value:     current.Reais(),
		Formatted: current.String(),
		Variation: service.VariationPercentage(current, previous),
	}
}
