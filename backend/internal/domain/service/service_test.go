package service_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/service"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func date(year int, month time.Month, day int) time.Time {
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}

func TestTotalBalanceIgnoraContasArquivadas(t *testing.T) {
	userID := uuid.New()

	checking, err := entity.NewAccount(userID, "Conta Corrente", vo.AccountTypeChecking, vo.NewMoney(100000), "", "")
	require.NoError(t, err)
	archived, err := entity.NewAccount(userID, "Conta Antiga", vo.AccountTypeSavings, vo.NewMoney(500000), "", "")
	require.NoError(t, err)
	archived.Archive()

	total := service.TotalBalance([]*entity.Account{checking, archived}, vo.NewMoney(50000))
	assert.Equal(t, int64(150000), total.Cents())
}

func TestSavingsRate(t *testing.T) {
	assert.InDelta(t, 42.1, service.SavingsRate(vo.NewMoney(1542000), vo.NewMoney(893210)), 0.1)
	assert.Equal(t, 0.0, service.SavingsRate(vo.ZeroMoney, vo.NewMoney(1000)))
}

func TestVariationPercentage(t *testing.T) {
	assert.InDelta(t, 12.5, service.VariationPercentage(vo.NewMoney(11250), vo.NewMoney(10000)), 0.01)
	assert.InDelta(t, -3.1, service.VariationPercentage(vo.NewMoney(9690), vo.NewMoney(10000)), 0.01)
	assert.Equal(t, 0.0, service.VariationPercentage(vo.ZeroMoney, vo.ZeroMoney))
	assert.Equal(t, 100.0, service.VariationPercentage(vo.NewMoney(100), vo.ZeroMoney),
		"sem base de comparacao a variacao e reportada como 100%")
}

func TestAverageTicket(t *testing.T) {
	assert.Equal(t, int64(28565), service.AverageTicket(vo.NewMoney(914080), 32).Cents())
	assert.Equal(t, vo.ZeroMoney, service.AverageTicket(vo.NewMoney(1000), 0))
}

func TestCalculateGoalProgress(t *testing.T) {
	now := date(2024, time.May, 31)
	deadline := date(2024, time.November, 30)

	goal, err := entity.NewGoal(uuid.New(), "Viagem Europa", vo.NewMoney(1000000), vo.NewMoney(543000), &deadline, "", "", "")
	require.NoError(t, err)

	progress := service.CalculateGoalProgress(goal, now)

	assert.InDelta(t, 54.3, progress.Percentage, 0.01)
	assert.Equal(t, int64(457000), progress.Remaining.Cents())
	assert.Equal(t, 6, progress.MonthsRemaining)
	assert.Equal(t, int64(76167), progress.SuggestedMonthly.Cents(), "R$ 4.570,00 divididos por 6 meses")
	assert.False(t, progress.Completed)
	assert.False(t, progress.Overdue)
}

func TestCalculateGoalProgressMetaConcluida(t *testing.T) {
	goal, err := entity.NewGoal(uuid.New(), "Reserva", vo.NewMoney(1000000), vo.NewMoney(1200000), nil, "", "", "")
	require.NoError(t, err)

	progress := service.CalculateGoalProgress(goal, time.Now().UTC())

	assert.Equal(t, 100.0, progress.Percentage, "o progresso e limitado a 100%")
	assert.True(t, progress.Completed)
	assert.Equal(t, vo.ZeroMoney, progress.Remaining)
	assert.Equal(t, vo.ZeroMoney, progress.SuggestedMonthly)
}

func TestCalculateGoalProgressPrazoVencido(t *testing.T) {
	deadline := date(2024, time.January, 31)
	goal, err := entity.NewGoal(uuid.New(), "Curso", vo.NewMoney(200000), vo.NewMoney(50000), &deadline, "", "", "")
	require.NoError(t, err)

	progress := service.CalculateGoalProgress(goal, date(2024, time.May, 31))

	assert.True(t, progress.Overdue)
	assert.Equal(t, 0, progress.MonthsRemaining)
	assert.Equal(t, int64(150000), progress.SuggestedMonthly.Cents(),
		"sem prazo restante o aporte sugerido e todo o saldo faltante")
}

func TestCalculateBudgetConsumption(t *testing.T) {
	tests := []struct {
		name           string
		limit, spent   vo.Money
		wantStatus     string
		wantRemaining  int64
		wantPercentage float64
	}{
		{"dentro do limite", vo.NewMoney(100000), vo.NewMoney(40000), service.BudgetStatusOK, 60000, 40},
		{"em alerta", vo.NewMoney(100000), vo.NewMoney(85000), service.BudgetStatusWarning, 15000, 85},
		{"estourado", vo.NewMoney(100000), vo.NewMoney(120000), service.BudgetStatusExceeded, 0, 120},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			consumption := service.CalculateBudgetConsumption(tc.limit, tc.spent)

			assert.Equal(t, tc.wantStatus, consumption.Status)
			assert.Equal(t, tc.wantRemaining, consumption.Remaining.Cents())
			assert.InDelta(t, tc.wantPercentage, consumption.Percentage, 0.01)
		})
	}
}

func TestBestDay(t *testing.T) {
	series := []repository.DailyTotal{
		{Day: date(2024, time.May, 1), Income: vo.NewMoney(10000), Expense: vo.NewMoney(5000)},
		{Day: date(2024, time.May, 15), Income: vo.NewMoney(134750), Expense: vo.NewMoney(0)},
		{Day: date(2024, time.May, 20), Income: vo.ZeroMoney, Expense: vo.NewMoney(20000)},
	}

	best := service.BestDay(series)
	require.NotNil(t, best)
	assert.Equal(t, date(2024, time.May, 15), best.Day)
	assert.Equal(t, int64(134750), best.Net.Cents())

	assert.Nil(t, service.BestDay(nil))
}

func TestTrendingCategory(t *testing.T) {
	alimentacao, transporte := uuid.New(), uuid.New()

	current := []repository.CategoryTotal{
		{CategoryID: alimentacao, Type: vo.TransactionTypeExpense, Total: vo.NewMoney(214170)},
		{CategoryID: transporte, Type: vo.TransactionTypeExpense, Total: vo.NewMoney(133882)},
	}
	previous := []repository.CategoryTotal{
		{CategoryID: alimentacao, Type: vo.TransactionTypeExpense, Total: vo.NewMoney(185800)},
		{CategoryID: transporte, Type: vo.TransactionTypeExpense, Total: vo.NewMoney(130000)},
	}

	trend := service.TrendingCategory(current, previous)
	require.NotNil(t, trend)
	assert.Equal(t, alimentacao, trend.CategoryID)
	assert.InDelta(t, 15.27, trend.Variation, 0.05)
}

func TestTrendingCategorySemBaseDeComparacao(t *testing.T) {
	nova := uuid.New()
	current := []repository.CategoryTotal{
		{CategoryID: nova, Type: vo.TransactionTypeExpense, Total: vo.NewMoney(50000)},
	}

	trend := service.TrendingCategory(current, nil)
	require.NotNil(t, trend)
	assert.Equal(t, nova, trend.CategoryID)
}

func TestTrendingCategoryIgnoraReceitas(t *testing.T) {
	current := []repository.CategoryTotal{
		{CategoryID: uuid.New(), Type: vo.TransactionTypeIncome, Total: vo.NewMoney(900000)},
	}

	assert.Nil(t, service.TrendingCategory(current, nil))
}
