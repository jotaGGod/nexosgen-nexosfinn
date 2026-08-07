package report

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/usecase/dashboard"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
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
	return TrendsFromCashflow(points), nil
}

// TrendsFromCashflow acrescenta a taxa de poupanca a uma serie ja carregada.
// O relatorio usa esta funcao para nao consultar a mesma serie mensal duas
// vezes na mesma requisicao.
func TrendsFromCashflow(points []dto.CashflowPointOutput) []dto.TrendPointOutput {
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
	return trends
}
