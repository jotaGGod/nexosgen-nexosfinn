package dto

import (
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
)

// CreateTransactionInput e o payload de criacao de lancamento.
//
// O mesmo DTO atende a interface web e as integracoes externas: o campo Type
// aceita tanto "income"/"expense" quanto "receita"/"despesa", o que simplifica
// o mapeamento feito por automacoes.
type CreateTransactionInput struct {
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	CategoryID  string  `json:"category_id"`
	AccountID   string  `json:"account_id"`
	Date        string  `json:"date"`
	Notes       string  `json:"notes"`
}

// UpdateTransactionInput e o payload de atualizacao de lancamento.
type UpdateTransactionInput struct {
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	CategoryID  string  `json:"category_id"`
	AccountID   string  `json:"account_id"`
	Date        string  `json:"date"`
	Notes       string  `json:"notes"`
}

// ListTransactionsInput descreve os filtros da listagem paginada.
type ListTransactionsInput struct {
	Search      string
	Type        string
	CategoryIDs []string
	AccountIDs  []string
	Period      PeriodInput
	Page        int
	PageSize    int
	SortBy      string
	SortDir     string
}

// TransactionOutput e a projecao de um lancamento, ja com categoria e conta
// resolvidas para que a interface nao precise de chamadas adicionais.
type TransactionOutput struct {
	ID          string            `json:"id"`
	Type        string            `json:"type"`
	Amount      MoneyOutput       `json:"amount"`
	Description string            `json:"description"`
	Notes       string            `json:"notes"`
	Date        string            `json:"date"`
	Category    CategoryRefOutput `json:"category"`
	Account     AccountRefOutput  `json:"account"`
	CreatedAt   string            `json:"created_at"`
}

// TransactionListOutput e a pagina de lancamentos.
type TransactionListOutput struct {
	Items      []TransactionOutput `json:"items"`
	Pagination PaginationOutput    `json:"pagination"`
	Totals     TransactionTotals   `json:"totals"`
}

// TransactionTotals resume os totais do filtro aplicado, alimentando os cards
// do topo da tela de transacoes.
type TransactionTotals struct {
	Income  MoneyOutput `json:"income"`
	Expense MoneyOutput `json:"expense"`
	Net     MoneyOutput `json:"net"`
}

// ToTransactionOutput serializa um lancamento com suas referencias.
func ToTransactionOutput(transaction *entity.Transaction, category *entity.Category, account *entity.Account) TransactionOutput {
	return TransactionOutput{
		ID:          transaction.ID.String(),
		Type:        transaction.Type.String(),
		Amount:      ToMoneyOutput(transaction.Amount),
		Description: transaction.Description,
		Notes:       transaction.Notes,
		Date:        FormatDate(transaction.OccurredOn),
		Category:    ToCategoryRefOutput(category),
		Account:     ToAccountRefOutput(account),
		CreatedAt:   transaction.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
