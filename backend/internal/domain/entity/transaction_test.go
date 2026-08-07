package entity_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newValidTransaction(t *testing.T) *entity.Transaction {
	t.Helper()

	transaction, err := entity.NewTransaction(
		uuid.New(), uuid.New(), uuid.New(),
		vo.TransactionTypeExpense,
		vo.NewMoney(35680),
		"Supermercado",
		"compras do mes",
		time.Date(2024, time.May, 30, 15, 4, 5, 0, time.UTC),
	)
	require.NoError(t, err)
	return transaction
}

func TestNewTransactionNormalizaCampos(t *testing.T) {
	transaction := newValidTransaction(t)

	assert.Equal(t, "Supermercado", transaction.Description)
	assert.Equal(t, time.Date(2024, time.May, 30, 0, 0, 0, 0, time.UTC), transaction.OccurredOn,
		"a hora deve ser descartada, a transacao e datada por dia")
}

func TestNewTransactionRejeitaValorNaoPositivo(t *testing.T) {
	for _, amount := range []vo.Money{vo.ZeroMoney, vo.NewMoney(-100)} {
		_, err := entity.NewTransaction(
			uuid.New(), uuid.New(), uuid.New(),
			vo.TransactionTypeExpense, amount, "Teste", "", time.Now(),
		)
		require.Error(t, err)
		assert.Equal(t, domainerr.KindInvalidInput, domainerr.KindOf(err))
	}
}

func TestNewTransactionRejeitaCamposObrigatorios(t *testing.T) {
	tests := map[string]struct {
		accountID   uuid.UUID
		categoryID  uuid.UUID
		description string
	}{
		"sem conta":     {uuid.Nil, uuid.New(), "Teste"},
		"sem categoria": {uuid.New(), uuid.Nil, "Teste"},
		"sem descricao": {uuid.New(), uuid.New(), "   "},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			_, err := entity.NewTransaction(
				uuid.New(), tc.accountID, tc.categoryID,
				vo.TransactionTypeExpense, vo.NewMoney(100), tc.description, "", time.Now(),
			)
			require.Error(t, err)
			assert.Equal(t, domainerr.KindInvalidInput, domainerr.KindOf(err))
		})
	}
}

func TestTransactionSignedAmount(t *testing.T) {
	expense := newValidTransaction(t)
	assert.Equal(t, int64(-35680), expense.SignedAmount().Cents())

	income, err := entity.NewTransaction(
		uuid.New(), uuid.New(), uuid.New(),
		vo.TransactionTypeIncome, vo.NewMoney(850000), "Salario", "", time.Now(),
	)
	require.NoError(t, err)
	assert.Equal(t, int64(850000), income.SignedAmount().Cents())
}

func TestTransactionUpdate(t *testing.T) {
	transaction := newValidTransaction(t)
	newAccount, newCategory := uuid.New(), uuid.New()

	err := transaction.Update(
		newAccount, newCategory,
		vo.TransactionTypeIncome, vo.NewMoney(125000),
		"Freelance Project", "", time.Date(2024, time.May, 30, 0, 0, 0, 0, time.UTC),
	)
	require.NoError(t, err)

	assert.Equal(t, newAccount, transaction.AccountID)
	assert.Equal(t, vo.TransactionTypeIncome, transaction.Type)
	assert.Equal(t, int64(125000), transaction.Amount.Cents())
}
