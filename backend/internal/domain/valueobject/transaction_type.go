package valueobject

import (
	"strings"

	domainerr "github.com/jacks/finapp/backend/internal/domain/errors"
)

// TransactionType distingue entrada de saida de dinheiro.
type TransactionType string

const (
	TransactionTypeIncome  TransactionType = "income"
	TransactionTypeExpense TransactionType = "expense"
)

// ParseTransactionType aceita tanto os identificadores canonicos quanto os
// termos em portugues usados pelo cliente e por integracoes externas.
func ParseTransactionType(raw string) (TransactionType, error) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "income", "receita":
		return TransactionTypeIncome, nil
	case "expense", "despesa":
		return TransactionTypeExpense, nil
	default:
		return "", domainerr.InvalidInput("invalid_transaction_type", "tipo de transacao deve ser 'income' ou 'expense'")
	}
}

func (t TransactionType) String() string { return string(t) }

func (t TransactionType) IsIncome() bool  { return t == TransactionTypeIncome }
func (t TransactionType) IsExpense() bool { return t == TransactionTypeExpense }

// IsValid reporta se o tipo esta entre os valores conhecidos.
func (t TransactionType) IsValid() bool {
	return t == TransactionTypeIncome || t == TransactionTypeExpense
}

// Signed devolve o valor com o sinal correspondente ao tipo, permitindo somar
// receitas e despesas em uma unica passagem.
func (t TransactionType) Signed(amount Money) Money {
	if t.IsExpense() {
		return amount.Abs().Neg()
	}
	return amount.Abs()
}
