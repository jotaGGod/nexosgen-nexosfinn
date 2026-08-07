package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

// Totals agrega receitas, despesas e contagem de um periodo.
type Totals struct {
	Income  vo.Money
	Expense vo.Money
	Count   int
}

// Net devolve o resultado liquido do periodo (receitas menos despesas).
func (t Totals) Net() vo.Money { return t.Income.Sub(t.Expense) }

// CategoryTotal e o total movimentado em uma categoria.
type CategoryTotal struct {
	CategoryID uuid.UUID
	Type       vo.TransactionType
	Total      vo.Money
	Count      int
}

// MonthlyTotal e o par receita/despesa de um mes.
type MonthlyTotal struct {
	Month   time.Time
	Income  vo.Money
	Expense vo.Money
}

// DailyTotal e o par receita/despesa de um dia.
type DailyTotal struct {
	Day     time.Time
	Income  vo.Money
	Expense vo.Money
}

// TransactionAnalyticsRepository concentra as consultas agregadas que
// alimentam dashboard, relatorios e orcamentos.
type TransactionAnalyticsRepository interface {
	// Totals soma receitas e despesas do periodo.
	Totals(ctx context.Context, userID uuid.UUID, period vo.Period) (Totals, error)

	// TotalsByCategory devolve o total por categoria no periodo, base do
	// grafico de rosca e do consumo dos orcamentos.
	TotalsByCategory(ctx context.Context, userID uuid.UUID, period vo.Period) ([]CategoryTotal, error)

	// MonthlySeries devolve a serie mensal de receitas e despesas.
	MonthlySeries(ctx context.Context, userID uuid.UUID, period vo.Period) ([]MonthlyTotal, error)

	// DailySeries devolve a serie diaria, usada no insight de "melhor dia".
	DailySeries(ctx context.Context, userID uuid.UUID, period vo.Period) ([]DailyTotal, error)

	// NetUntil devolve o resultado liquido acumulado ate a data informada,
	// base do calculo de saldo total.
	NetUntil(ctx context.Context, userID uuid.UUID, until time.Time) (vo.Money, error)

	// NetByAccount devolve o liquido movimentado em cada conta, usado para
	// derivar o saldo individual sem manter um campo denormalizado.
	NetByAccount(ctx context.Context, userID uuid.UUID) (map[uuid.UUID]vo.Money, error)

	// Extremes devolve o maior e o menor lancamento do tipo no periodo.
	Extremes(ctx context.Context, userID uuid.UUID, period vo.Period, transactionType vo.TransactionType) (highest, lowest *entity.Transaction, err error)
}
