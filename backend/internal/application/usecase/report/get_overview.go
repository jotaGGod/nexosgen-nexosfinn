// Package report reune os casos de uso da tela de relatorios.
package report

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/parallel"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/service"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

// GetOverviewUseCase monta os cards da aba "Visao Geral".
type GetOverviewUseCase struct {
	analytics repository.TransactionAnalyticsRepository
}

// NewGetOverviewUseCase monta o caso de uso.
func NewGetOverviewUseCase(analytics repository.TransactionAnalyticsRepository) *GetOverviewUseCase {
	return &GetOverviewUseCase{analytics: analytics}
}

// Execute apura receitas, despesas, ticket medio e volume de lancamentos,
// cada um com a variacao contra o periodo anterior.
func (uc *GetOverviewUseCase) Execute(ctx context.Context, userID uuid.UUID, period vo.Period) (dto.ReportOverviewOutput, error) {
	var current, previous repository.Totals

	err := parallel.Run(ctx,
		func(taskCtx context.Context) (taskErr error) {
			current, taskErr = uc.analytics.Totals(taskCtx, userID, period)
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			previous, taskErr = uc.analytics.Totals(taskCtx, userID, period.Previous())
			return taskErr
		},
	)
	if err != nil {
		return dto.ReportOverviewOutput{}, err
	}

	// O ticket medio considera apenas despesas: e a leitura util de "quanto
	// custa, em media, cada compra".
	currentTicket := service.AverageTicket(current.Expense, expenseCount(current))
	previousTicket := service.AverageTicket(previous.Expense, expenseCount(previous))

	return dto.ReportOverviewOutput{
		TotalIncome:   metric(current.Income, previous.Income),
		TotalExpense:  metric(current.Expense, previous.Expense),
		AverageTicket: metric(currentTicket, previousTicket),
		TransactionCount: dto.MetricOutput{
			Value:     float64(current.Count),
			Formatted: formatCount(current.Count),
			Variation: countVariation(current.Count, previous.Count),
		},
	}, nil
}

// expenseCount aproxima a quantidade de despesas a partir dos totais.
// Totals traz a contagem geral; quando nao ha despesa, o ticket e zero de
// qualquer forma.
func expenseCount(totals repository.Totals) int {
	if !totals.Expense.IsPositive() {
		return 0
	}
	return totals.Count
}

func metric(current, previous vo.Money) dto.MetricOutput {
	return dto.MetricOutput{
		Value:     current.Reais(),
		Formatted: current.String(),
		Variation: service.VariationPercentage(current, previous),
	}
}

func countVariation(current, previous int) float64 {
	return service.VariationPercentage(vo.NewMoney(int64(current)), vo.NewMoney(int64(previous)))
}

func formatCount(count int) string {
	digits := []byte{}
	if count == 0 {
		return "0"
	}
	for count > 0 {
		digits = append([]byte{byte('0' + count%10)}, digits...)
		count /= 10
	}
	return string(digits)
}
