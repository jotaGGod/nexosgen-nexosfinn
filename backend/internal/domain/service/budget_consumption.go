package service

import (
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

// Estados possiveis de um orcamento, usados para colorir a barra na interface.
const (
	BudgetStatusOK       = "ok"
	BudgetStatusWarning  = "warning"
	BudgetStatusExceeded = "exceeded"
)

// warningThreshold e o percentual a partir do qual o orcamento entra em alerta.
const warningThreshold = 80.0

// BudgetConsumption e a leitura calculada de um orcamento mensal.
type BudgetConsumption struct {
	Limit      vo.Money
	Spent      vo.Money
	Remaining  vo.Money
	Percentage float64
	Status     string
}

// CalculateBudgetConsumption compara o gasto do mes com o limite definido.
//
// Remaining nunca fica negativo: o estouro e comunicado por Status e por
// Percentage acima de 100.
func CalculateBudgetConsumption(limit, spent vo.Money) BudgetConsumption {
	remaining := limit.Sub(spent)
	if remaining.IsNegative() {
		remaining = vo.ZeroMoney
	}

	percentage := spent.PercentageOf(limit)

	status := BudgetStatusOK
	switch {
	case spent.GreaterThan(limit):
		status = BudgetStatusExceeded
	case percentage >= warningThreshold:
		status = BudgetStatusWarning
	}

	return BudgetConsumption{
		Limit:      limit,
		Spent:      spent,
		Remaining:  remaining,
		Percentage: percentage,
		Status:     status,
	}
}
