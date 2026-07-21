package dashboard_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/fakes"
	"github.com/jacks/finapp/backend/internal/application/usecase/dashboard"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func date(year int, month time.Month, day int) time.Time {
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}

type scenario struct {
	store      *fakes.Store
	userID     uuid.UUID
	accountID  uuid.UUID
	categoryID uuid.UUID
}

func newScenario(t *testing.T) *scenario {
	t.Helper()

	store := fakes.NewStore()
	userID := uuid.New()
	ctx := context.Background()

	account, err := entity.NewAccount(userID, "Conta Corrente", vo.AccountTypeChecking, vo.NewMoney(500000), "", "")
	require.NoError(t, err)
	require.NoError(t, store.AccountRepo().Create(ctx, account))

	category, err := entity.NewCategory(userID, "Moradia", vo.TransactionTypeExpense, "#7C3AED", "home")
	require.NoError(t, err)
	require.NoError(t, store.CategoryRepo().Create(ctx, category))

	return &scenario{store: store, userID: userID, accountID: account.ID, categoryID: category.ID}
}

func (s *scenario) addExpense(t *testing.T, amountCents int64, on time.Time) {
	t.Helper()

	transaction, err := entity.NewTransaction(
		s.userID, s.accountID, s.categoryID,
		vo.TransactionTypeExpense, vo.NewMoney(amountCents), "Aluguel", "", on,
	)
	require.NoError(t, err)
	require.NoError(t, s.store.TransactionRepo().Create(context.Background(), transaction))
}

func (s *scenario) addIncome(t *testing.T, amountCents int64, on time.Time) {
	t.Helper()

	category, err := entity.NewCategory(s.userID, "Salario "+on.Format("2006-01-02"), vo.TransactionTypeIncome, "", "")
	require.NoError(t, err)
	require.NoError(t, s.store.CategoryRepo().Create(context.Background(), category))

	transaction, err := entity.NewTransaction(
		s.userID, s.accountID, category.ID,
		vo.TransactionTypeIncome, vo.NewMoney(amountCents), "Salario", "", on,
	)
	require.NoError(t, err)
	require.NoError(t, s.store.TransactionRepo().Create(context.Background(), transaction))
}

func TestGetSummaryCalculaVariacaoContraMesAnterior(t *testing.T) {
	s := newScenario(t)

	// Abril: receita 10.000, despesa 4.000
	s.addIncome(t, 1000000, date(2024, time.April, 10))
	s.addExpense(t, 400000, date(2024, time.April, 12))

	// Maio: receita 12.500, despesa 3.000
	s.addIncome(t, 1250000, date(2024, time.May, 10))
	s.addExpense(t, 300000, date(2024, time.May, 12))

	useCase := dashboard.NewGetSummaryUseCase(s.store.AccountRepo(), s.store.AnalyticsRepo())

	summary, err := useCase.Execute(context.Background(), s.userID, vo.NewMonthPeriod(date(2024, time.May, 15)))
	require.NoError(t, err)

	assert.Equal(t, 12500.0, summary.Income.Value)
	assert.InDelta(t, 25.0, summary.Income.Variation, 0.01, "12.500 sobre 10.000 e +25%")

	assert.Equal(t, 3000.0, summary.Expense.Value)
	assert.InDelta(t, -25.0, summary.Expense.Variation, 0.01)

	assert.Equal(t, 9500.0, summary.Savings.Value)
	assert.InDelta(t, 76.0, summary.SavingsRate, 0.01)

	// Saldo total: 5.000 iniciais + 10.000 - 4.000 + 12.500 - 3.000
	assert.Equal(t, 20500.0, summary.TotalBalance.Value)
}

func TestGetSummaryPeriodoSemMovimento(t *testing.T) {
	s := newScenario(t)

	useCase := dashboard.NewGetSummaryUseCase(s.store.AccountRepo(), s.store.AnalyticsRepo())

	summary, err := useCase.Execute(context.Background(), s.userID, vo.NewMonthPeriod(date(2024, time.May, 15)))
	require.NoError(t, err)

	assert.Equal(t, 0.0, summary.Income.Value)
	assert.Equal(t, 0.0, summary.Income.Variation, "sem movimento em nenhum dos periodos, nao ha variacao")
	assert.Equal(t, 5000.0, summary.TotalBalance.Value, "o saldo inicial das contas continua valendo")
}

func TestGetCashflowPreencheMesesSemMovimento(t *testing.T) {
	s := newScenario(t)
	s.addIncome(t, 1000000, date(2024, time.May, 10))

	useCase := dashboard.NewGetCashflowUseCase(s.store.AnalyticsRepo())

	points, err := useCase.Execute(context.Background(), s.userID, date(2024, time.May, 31), 5)
	require.NoError(t, err)

	require.Len(t, points, 5)
	assert.Equal(t, []string{"Jan", "Fev", "Mar", "Abr", "Mai"}, []string{
		points[0].Label, points[1].Label, points[2].Label, points[3].Label, points[4].Label,
	})
	assert.Equal(t, 0.0, points[0].Income, "meses sem movimento entram zerados, sem buraco na linha")
	assert.Equal(t, 10000.0, points[4].Income)
}

func TestGetByCategoryOrdenaEPercentua(t *testing.T) {
	s := newScenario(t)
	s.addExpense(t, 300000, date(2024, time.May, 5))
	s.addExpense(t, 100000, date(2024, time.May, 6))

	useCase := dashboard.NewGetByCategoryUseCase(s.store.CategoryRepo(), s.store.AnalyticsRepo())

	distribution, err := useCase.Execute(
		context.Background(), s.userID,
		vo.NewMonthPeriod(date(2024, time.May, 15)),
		vo.TransactionTypeExpense,
	)
	require.NoError(t, err)

	require.Len(t, distribution.Slices, 1)
	assert.Equal(t, "Moradia", distribution.Slices[0].Name)
	assert.Equal(t, "#7C3AED", distribution.Slices[0].Color)
	assert.Equal(t, 4000.0, distribution.Total.Amount)
	assert.Equal(t, 100.0, distribution.Slices[0].Percentage)
	assert.Equal(t, 2, distribution.Slices[0].Count)
}
