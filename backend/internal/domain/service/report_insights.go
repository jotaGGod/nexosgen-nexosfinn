package service

import (
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

// VariationPercentage devolve a variacao percentual entre dois periodos,
// alimentando os rotulos "+12,5% vs mes anterior" dos cards de resumo.
//
// Sem base de comparacao (periodo anterior zerado), qualquer valor atual
// diferente de zero e reportado como 100%.
func VariationPercentage(current, previous vo.Money) float64 {
	if previous.IsZero() {
		if current.IsZero() {
			return 0
		}
		return 100
	}
	delta := current.Sub(previous)
	ratio := float64(delta.Cents()) / math.Abs(float64(previous.Cents())) * 100
	return math.Round(ratio*100) / 100
}

// AverageTicket devolve o valor medio por lancamento.
func AverageTicket(total vo.Money, count int) vo.Money {
	if count <= 0 {
		return vo.ZeroMoney
	}
	return vo.NewMoney(total.Cents() / int64(count))
}

// DayHighlight aponta um dia especifico da serie diaria.
type DayHighlight struct {
	Day time.Time
	Net vo.Money
}

// BestDay devolve o dia de melhor resultado liquido no periodo.
// Retorna nil quando nao ha movimento.
func BestDay(series []repository.DailyTotal) *DayHighlight {
	var best *DayHighlight
	for _, day := range series {
		net := day.Income.Sub(day.Expense)
		if best == nil || net.GreaterThan(best.Net) {
			best = &DayHighlight{Day: day.Day, Net: net}
		}
	}
	return best
}

// CategoryTrend descreve a evolucao de uma categoria entre dois periodos.
type CategoryTrend struct {
	CategoryID uuid.UUID
	Current    vo.Money
	Previous   vo.Money
	Variation  float64
}

// TrendingCategory devolve a categoria de despesa que mais cresceu em relacao
// ao periodo anterior — o insight "categoria em alta" dos relatorios.
//
// Categorias sem gasto no periodo anterior sao consideradas apenas se nao
// houver nenhuma com base de comparacao, para evitar que uma estreia com
// valor irrisorio ofusque um crescimento real.
func TrendingCategory(current, previous []repository.CategoryTotal) *CategoryTrend {
	previousByCategory := make(map[uuid.UUID]vo.Money, len(previous))
	for _, item := range previous {
		if item.Type.IsExpense() {
			previousByCategory[item.CategoryID] = item.Total
		}
	}

	var best *CategoryTrend
	var bestWithoutBaseline *CategoryTrend

	for _, item := range current {
		if !item.Type.IsExpense() || !item.Total.IsPositive() {
			continue
		}

		previousTotal, hadBaseline := previousByCategory[item.CategoryID]
		trend := &CategoryTrend{
			CategoryID: item.CategoryID,
			Current:    item.Total,
			Previous:   previousTotal,
			Variation:  VariationPercentage(item.Total, previousTotal),
		}

		if !hadBaseline || previousTotal.IsZero() {
			if bestWithoutBaseline == nil || trend.Current.GreaterThan(bestWithoutBaseline.Current) {
				bestWithoutBaseline = trend
			}
			continue
		}

		if trend.Variation <= 0 {
			continue
		}
		if best == nil || trend.Variation > best.Variation {
			best = trend
		}
	}

	if best != nil {
		return best
	}
	return bestWithoutBaseline
}
