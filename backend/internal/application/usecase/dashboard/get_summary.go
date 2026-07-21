package dashboard

import (
	"context"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	"github.com/jacks/finapp/backend/internal/domain/service"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
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

	current, err := uc.analytics.Totals(ctx, userID, period)
	if err != nil {
		return dto.DashboardSummaryOutput{}, err
	}
	previous, err := uc.analytics.Totals(ctx, userID, previousPeriod)
	if err != nil {
		return dto.DashboardSummaryOutput{}, err
	}

	accountList, err := uc.accounts.ListByUser(ctx, userID, false)
	if err != nil {
		return dto.DashboardSummaryOutput{}, err
	}

	// O saldo total e um acumulado, nao um total do periodo: ele considera
	// tudo que aconteceu ate a data final do recorte.
	netUntilNow, err := uc.analytics.NetUntil(ctx, userID, period.End())
	if err != nil {
		return dto.DashboardSummaryOutput{}, err
	}
	netUntilPrevious, err := uc.analytics.NetUntil(ctx, userID, previousPeriod.End())
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
