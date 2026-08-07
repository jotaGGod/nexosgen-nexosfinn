package budget_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/fakes"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/budget"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/service"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fixture struct {
	store           *fakes.Store
	userID          uuid.UUID
	expenseCategory uuid.UUID
	incomeCategory  uuid.UUID
	upsert          *budget.UpsertUseCase
	list            *budget.ListUseCase
}

func newFixture(t *testing.T) *fixture {
	t.Helper()

	store := fakes.NewStore()
	userID := uuid.New()
	ctx := context.Background()

	expense, err := entity.NewCategory(userID, "Alimentacao", vo.TransactionTypeExpense, "#10B981", "utensils")
	require.NoError(t, err)
	require.NoError(t, store.CategoryRepo().Create(ctx, expense))

	income, err := entity.NewCategory(userID, "Salario", vo.TransactionTypeIncome, "", "")
	require.NoError(t, err)
	require.NoError(t, store.CategoryRepo().Create(ctx, income))

	return &fixture{
		store:           store,
		userID:          userID,
		expenseCategory: expense.ID,
		incomeCategory:  income.ID,
		upsert:          budget.NewUpsertUseCase(store.BudgetRepo(), store.CategoryRepo(), store.AnalyticsRepo()),
		list:            budget.NewListUseCase(store.BudgetRepo(), store.CategoryRepo(), store.AnalyticsRepo()),
	}
}

func (f *fixture) addExpense(t *testing.T, amountCents int64, on time.Time) {
	t.Helper()

	account, err := entity.NewAccount(f.userID, "Conta "+on.Format("02-01"), vo.AccountTypeChecking, vo.ZeroMoney, "", "")
	require.NoError(t, err)
	require.NoError(t, f.store.AccountRepo().Create(context.Background(), account))

	transaction, err := entity.NewTransaction(
		f.userID, account.ID, f.expenseCategory,
		vo.TransactionTypeExpense, vo.NewMoney(amountCents), "Mercado", "", on,
	)
	require.NoError(t, err)
	require.NoError(t, f.store.TransactionRepo().Create(context.Background(), transaction))
}

func TestUpsertEhIdempotentePorCategoriaEMes(t *testing.T) {
	f := newFixture(t)
	ctx := context.Background()

	input := dto.UpsertBudgetInput{
		CategoryID:  f.expenseCategory.String(),
		Month:       "2024-05-01",
		LimitAmount: 1000,
	}

	first, err := f.upsert.Execute(ctx, f.userID, input)
	require.NoError(t, err)

	input.LimitAmount = 1500
	input.Month = "2024-05-20" // qualquer dia do mesmo mes aponta para o mesmo orcamento

	second, err := f.upsert.Execute(ctx, f.userID, input)
	require.NoError(t, err)

	assert.Equal(t, first.ID, second.ID, "definir de novo o mesmo mes atualiza em vez de duplicar")
	assert.Equal(t, 1500.0, second.Limit.Amount)
	assert.Len(t, f.store.Budgets, 1)
	assert.Equal(t, "2024-05-01", second.Month, "o mes e normalizado para o primeiro dia")
}

func TestUpsertRejeitaCategoriaDeReceita(t *testing.T) {
	f := newFixture(t)

	_, err := f.upsert.Execute(context.Background(), f.userID, dto.UpsertBudgetInput{
		CategoryID:  f.incomeCategory.String(),
		Month:       "2024-05-01",
		LimitAmount: 1000,
	})
	require.Error(t, err)

	domainError, ok := domainerr.As(err)
	require.True(t, ok)
	assert.Equal(t, "category_must_be_expense", domainError.Code)
}

func TestListApuraConsumoDoMes(t *testing.T) {
	f := newFixture(t)
	ctx := context.Background()

	_, err := f.upsert.Execute(ctx, f.userID, dto.UpsertBudgetInput{
		CategoryID:  f.expenseCategory.String(),
		Month:       "2024-05-01",
		LimitAmount: 1000,
	})
	require.NoError(t, err)

	f.addExpense(t, 85000, time.Date(2024, time.May, 10, 0, 0, 0, 0, time.UTC))
	f.addExpense(t, 20000, time.Date(2024, time.June, 10, 0, 0, 0, 0, time.UTC)) // outro mes, ignorado

	output, err := f.list.Execute(ctx, f.userID, dto.ListBudgetsInput{Month: "2024-05-15"})
	require.NoError(t, err)

	require.Len(t, output.Items, 1)
	item := output.Items[0]

	assert.Equal(t, 850.0, item.Spent.Amount)
	assert.Equal(t, 150.0, item.Remaining.Amount)
	assert.InDelta(t, 85.0, item.Percentage, 0.01)
	assert.Equal(t, service.BudgetStatusWarning, item.Status)
	assert.Equal(t, "Alimentacao", item.Category.Name)
	assert.Equal(t, 1000.0, output.TotalLimit.Amount)
}

func TestListMesSemOrcamento(t *testing.T) {
	f := newFixture(t)

	output, err := f.list.Execute(context.Background(), f.userID, dto.ListBudgetsInput{Month: "2024-05-01"})
	require.NoError(t, err)

	assert.Empty(t, output.Items)
	assert.Equal(t, 0.0, output.Percentage, "sem limite definido nao ha divisao por zero")
}
