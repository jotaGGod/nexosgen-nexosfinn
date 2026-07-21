package dto

import (
	"github.com/jacks/finapp/backend/internal/domain/entity"
	"github.com/jacks/finapp/backend/internal/domain/service"
)

// UpsertBudgetInput define ou redefine o limite de uma categoria em um mes.
//
// A operacao e idempotente por (categoria, mes): definir duas vezes o mesmo
// mes atualiza o limite em vez de duplicar o orcamento.
type UpsertBudgetInput struct {
	CategoryID  string  `json:"category_id"`
	Month       string  `json:"month"` // AAAA-MM-DD; qualquer dia do mes de referencia
	LimitAmount float64 `json:"limit_amount"`
}

// ListBudgetsInput filtra os orcamentos por mes de referencia.
type ListBudgetsInput struct {
	Month string
}

// BudgetOutput e a projecao do orcamento com o consumo do mes ja apurado.
type BudgetOutput struct {
	ID         string            `json:"id"`
	Category   CategoryRefOutput `json:"category"`
	Month      string            `json:"month"`
	Limit      MoneyOutput       `json:"limit"`
	Spent      MoneyOutput       `json:"spent"`
	Remaining  MoneyOutput       `json:"remaining"`
	Percentage float64           `json:"percentage"`
	Status     string            `json:"status"`
}

// BudgetListOutput agrega os orcamentos do mes e o consolidado.
type BudgetListOutput struct {
	Month      string         `json:"month"`
	Items      []BudgetOutput `json:"items"`
	TotalLimit MoneyOutput    `json:"total_limit"`
	TotalSpent MoneyOutput    `json:"total_spent"`
	Percentage float64        `json:"percentage"`
}

// ToBudgetOutput serializa o orcamento junto do seu consumo.
func ToBudgetOutput(budget *entity.Budget, category *entity.Category, consumption service.BudgetConsumption) BudgetOutput {
	return BudgetOutput{
		ID:         budget.ID.String(),
		Category:   ToCategoryRefOutput(category),
		Month:      FormatDate(budget.Month),
		Limit:      ToMoneyOutput(consumption.Limit),
		Spent:      ToMoneyOutput(consumption.Spent),
		Remaining:  ToMoneyOutput(consumption.Remaining),
		Percentage: consumption.Percentage,
		Status:     consumption.Status,
	}
}
