package report

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/application/usecase/dashboard"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// GetTrendsUseCase monta a serie da aba "Tendencias".
//
// Reaproveita a serie de fluxo de caixa do dashboard e acrescenta a taxa de
// poupanca de cada mes, que e a leitura que a aba adiciona.
type GetTrendsUseCase struct {
	cashflow *dashboard.GetCashflowUseCase
}

// NewGetTrendsUseCase monta o caso de uso.
func NewGetTrendsUseCase(cashflow *dashboard.GetCashflowUseCase) *GetTrendsUseCase {
	return &GetTrendsUseCase{cashflow: cashflow}
}

// Execute devolve a evolucao mensal com a taxa de poupanca.
func (uc *GetTrendsUseCase) Execute(ctx context.Context, userID uuid.UUID, reference time.Time, months int) ([]dto.TrendPointOutput, error) {
	points, err := uc.cashflow.Execute(ctx, userID, reference, months)
	if err != nil {
		return nil, err
	}

	trends := make([]dto.TrendPointOutput, 0, len(points))
	for _, point := range points {
		income, _ := vo.NewMoneyFromReais(point.Income)
		expense, _ := vo.NewMoneyFromReais(point.Expense)

		trends = append(trends, dto.TrendPointOutput{
			Month:       point.Month,
			Label:       point.Label,
			Income:      point.Income,
			Expense:     point.Expense,
			Net:         point.Net,
			SavingsRate: savingsRate(income, expense),
		})
	}
	return trends, nil
}
