package dashboard

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
)

// defaultCashflowMonths e a janela padrao do grafico de linha.
const defaultCashflowMonths = 5

// GetCashflowUseCase monta a serie mensal de receitas e despesas.
type GetCashflowUseCase struct {
	analytics repository.TransactionAnalyticsRepository
}

// NewGetCashflowUseCase monta o caso de uso.
func NewGetCashflowUseCase(analytics repository.TransactionAnalyticsRepository) *GetCashflowUseCase {
	return &GetCashflowUseCase{analytics: analytics}
}

// Execute devolve os ultimos months meses encerrados na data de referencia.
func (uc *GetCashflowUseCase) Execute(ctx context.Context, userID uuid.UUID, reference time.Time, months int) ([]dto.CashflowPointOutput, error) {
	if months < 1 {
		months = defaultCashflowMonths
	}
	if months > 24 {
		months = 24
	}

	period := trailingMonthsPeriod(reference, months)

	totals, err := uc.analytics.MonthlySeries(ctx, userID, period)
	if err != nil {
		return nil, err
	}

	return buildCashflowSeries(period, totals), nil
}
