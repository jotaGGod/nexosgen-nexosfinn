package transaction_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/fakes"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/usecase/transaction"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fixture struct {
	store            *fakes.Store
	userID           uuid.UUID
	accountID        uuid.UUID
	expenseCategory  uuid.UUID
	incomeCategory   uuid.UUID
	create           *transaction.CreateUseCase
	update           *transaction.UpdateUseCase
	list             *transaction.ListUseCase
	deleteTransation *transaction.DeleteUseCase
}

func newFixture(t *testing.T) *fixture {
	t.Helper()

	store := fakes.NewStore()
	userID := uuid.New()
	ctx := context.Background()

	account, err := entity.NewAccount(userID, "Conta Corrente", vo.AccountTypeChecking, vo.NewMoney(100000), "", "")
	require.NoError(t, err)
	require.NoError(t, store.AccountRepo().Create(ctx, account))

	expense, err := entity.NewCategory(userID, "Alimentacao", vo.TransactionTypeExpense, "#10B981", "utensils")
	require.NoError(t, err)
	require.NoError(t, store.CategoryRepo().Create(ctx, expense))

	income, err := entity.NewCategory(userID, "Salario", vo.TransactionTypeIncome, "#10B981", "wallet")
	require.NoError(t, err)
	require.NoError(t, store.CategoryRepo().Create(ctx, income))

	return &fixture{
		store:            store,
		userID:           userID,
		accountID:        account.ID,
		expenseCategory:  expense.ID,
		incomeCategory:   income.ID,
		create:           transaction.NewCreateUseCase(store.TransactionRepo(), store.CategoryRepo(), store.AccountRepo()),
		update:           transaction.NewUpdateUseCase(store.TransactionRepo(), store.CategoryRepo(), store.AccountRepo()),
		list:             transaction.NewListUseCase(store.TransactionRepo(), store.CategoryRepo(), store.AccountRepo()),
		deleteTransation: transaction.NewDeleteUseCase(store.TransactionRepo()),
	}
}

func (f *fixture) expenseInput() dto.CreateTransactionInput {
	return dto.CreateTransactionInput{
		Type:        "expense",
		Amount:      356.80,
		Description: "Supermercado",
		CategoryID:  f.expenseCategory.String(),
		AccountID:   f.accountID.String(),
		Date:        "2024-05-30",
	}
}

func TestCreate(t *testing.T) {
	f := newFixture(t)

	output, err := f.create.Execute(context.Background(), f.userID, f.expenseInput())
	require.NoError(t, err)

	assert.Equal(t, "expense", output.Type)
	assert.Equal(t, 356.80, output.Amount.Amount)
	assert.Equal(t, "R$ 356,80", output.Amount.Formatted)
	assert.Equal(t, "Alimentacao", output.Category.Name, "a categoria vem resolvida na resposta")
	assert.Equal(t, "2024-05-30", output.Date)
}

func TestCreateSemDataUsaHoje(t *testing.T) {
	f := newFixture(t)

	input := f.expenseInput()
	input.Date = ""

	output, err := f.create.Execute(context.Background(), f.userID, input)
	require.NoError(t, err)
	assert.Equal(t, time.Now().UTC().Format("2006-01-02"), output.Date)
}

func TestCreateRejeitaCategoriaDeTipoIncompativel(t *testing.T) {
	f := newFixture(t)

	input := f.expenseInput()
	input.CategoryID = f.incomeCategory.String() // categoria de receita em uma despesa

	_, err := f.create.Execute(context.Background(), f.userID, input)
	require.Error(t, err)

	domainError, ok := domainerr.As(err)
	require.True(t, ok)
	assert.Equal(t, "category_type_mismatch", domainError.Code)
}

func TestCreateRejeitaCategoriaDeOutroUsuario(t *testing.T) {
	f := newFixture(t)
	ctx := context.Background()

	outra, err := entity.NewCategory(uuid.New(), "Alheia", vo.TransactionTypeExpense, "", "")
	require.NoError(t, err)
	require.NoError(t, f.store.CategoryRepo().Create(ctx, outra))

	input := f.expenseInput()
	input.CategoryID = outra.ID.String()

	_, err = f.create.Execute(ctx, f.userID, input)
	require.Error(t, err)

	domainError, ok := domainerr.As(err)
	require.True(t, ok)
	assert.Equal(t, "category_not_found", domainError.Code)
}

func TestCreateAcumulaErrosDeValidacao(t *testing.T) {
	f := newFixture(t)

	_, err := f.create.Execute(context.Background(), f.userID, dto.CreateTransactionInput{})
	require.Error(t, err)

	domainError, ok := domainerr.As(err)
	require.True(t, ok)
	assert.Contains(t, domainError.Fields, "type")
	assert.Contains(t, domainError.Fields, "amount")
	assert.Contains(t, domainError.Fields, "description")
	assert.Contains(t, domainError.Fields, "category_id")
	assert.Contains(t, domainError.Fields, "account_id")
}

func TestUpdateNaoAlcancaLancamentoDeOutroUsuario(t *testing.T) {
	f := newFixture(t)
	ctx := context.Background()

	created, err := f.create.Execute(ctx, f.userID, f.expenseInput())
	require.NoError(t, err)

	_, err = f.update.Execute(ctx, uuid.New(), uuid.MustParse(created.ID), dto.UpdateTransactionInput{
		Type:        "expense",
		Amount:      10,
		Description: "Invasao",
		CategoryID:  f.expenseCategory.String(),
		AccountID:   f.accountID.String(),
		Date:        "2024-05-30",
	})
	require.Error(t, err)
	assert.Equal(t, domainerr.KindNotFound, domainerr.KindOf(err))
}

func TestListAplicaFiltroTotaisEPaginacao(t *testing.T) {
	f := newFixture(t)
	ctx := context.Background()

	for i := 0; i < 3; i++ {
		_, err := f.create.Execute(ctx, f.userID, f.expenseInput())
		require.NoError(t, err)
	}

	_, err := f.create.Execute(ctx, f.userID, dto.CreateTransactionInput{
		Type:        "income",
		Amount:      8500,
		Description: "Salario",
		CategoryID:  f.incomeCategory.String(),
		AccountID:   f.accountID.String(),
		Date:        "2024-05-31",
	})
	require.NoError(t, err)

	page, err := f.list.Execute(ctx, f.userID, dto.ListTransactionsInput{Page: 1, PageSize: 2})
	require.NoError(t, err)

	assert.Len(t, page.Items, 2, "a pagina respeita o page_size")
	assert.Equal(t, 4, page.Pagination.Total)
	assert.Equal(t, 2, page.Pagination.TotalPages)

	// Os totais consideram o filtro inteiro, nao apenas a pagina exibida.
	assert.Equal(t, 8500.0, page.Totals.Income.Amount)
	assert.InDelta(t, 1070.40, page.Totals.Expense.Amount, 0.001)
	assert.InDelta(t, 7429.60, page.Totals.Net.Amount, 0.001)
}

func TestListFiltraPorTipoEBusca(t *testing.T) {
	f := newFixture(t)
	ctx := context.Background()

	_, err := f.create.Execute(ctx, f.userID, f.expenseInput())
	require.NoError(t, err)
	_, err = f.create.Execute(ctx, f.userID, dto.CreateTransactionInput{
		Type: "income", Amount: 8500, Description: "Salario",
		CategoryID: f.incomeCategory.String(), AccountID: f.accountID.String(), Date: "2024-05-31",
	})
	require.NoError(t, err)

	onlyIncome, err := f.list.Execute(ctx, f.userID, dto.ListTransactionsInput{Type: "income"})
	require.NoError(t, err)
	assert.Len(t, onlyIncome.Items, 1)

	searched, err := f.list.Execute(ctx, f.userID, dto.ListTransactionsInput{Search: "superm"})
	require.NoError(t, err)
	require.Len(t, searched.Items, 1)
	assert.Equal(t, "Supermercado", searched.Items[0].Description)
}

func TestDelete(t *testing.T) {
	f := newFixture(t)
	ctx := context.Background()

	created, err := f.create.Execute(ctx, f.userID, f.expenseInput())
	require.NoError(t, err)

	require.NoError(t, f.deleteTransation.Execute(ctx, f.userID, uuid.MustParse(created.ID)))
	assert.Empty(t, f.store.Transactions)
}
