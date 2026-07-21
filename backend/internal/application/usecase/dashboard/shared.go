// Package dashboard reune os casos de uso que alimentam a tela inicial.
package dashboard

import (
	"context"
	"sort"
	"time"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// monthAbbreviations rotula os pontos do grafico de fluxo de caixa em pt-BR.
var monthAbbreviations = [...]string{"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"}

// MonthLabel devolve a abreviacao do mes.
func MonthLabel(t time.Time) string { return monthAbbreviations[int(t.UTC().Month())-1] }

// trailingMonthsPeriod devolve o intervalo que cobre os ultimos months meses,
// terminando no fim do mes de referencia.
func trailingMonthsPeriod(reference time.Time, months int) vo.Period {
	if months < 1 {
		months = 1
	}
	current := vo.NewMonthPeriod(reference)
	first := vo.NewMonthPeriod(current.Start().AddDate(0, -(months - 1), 0))
	period, _ := vo.NewPeriod(first.Start(), current.End())
	return period
}

// buildCashflowSeries converte a serie do repositorio em pontos do grafico,
// preenchendo com zero os meses sem movimento — uma linha com buracos
// distorceria a leitura da tendencia.
func buildCashflowSeries(period vo.Period, totals []repository.MonthlyTotal) []dto.CashflowPointOutput {
	byMonth := make(map[string]repository.MonthlyTotal, len(totals))
	for _, total := range totals {
		byMonth[total.Month.UTC().Format("2006-01")] = total
	}

	points := make([]dto.CashflowPointOutput, 0, 12)
	cursor := entity.NormalizeMonth(period.Start())
	last := entity.NormalizeMonth(period.End())

	for !cursor.After(last) {
		key := cursor.Format("2006-01")
		total := byMonth[key]

		points = append(points, dto.CashflowPointOutput{
			Month:   key,
			Label:   MonthLabel(cursor),
			Income:  total.Income.Reais(),
			Expense: total.Expense.Reais(),
			Net:     total.Income.Sub(total.Expense).Reais(),
		})
		cursor = cursor.AddDate(0, 1, 0)
	}

	return points
}

// buildDistribution monta o grafico de rosca de um tipo de transacao,
// ordenando as fatias da maior para a menor.
func buildDistribution(
	totals []repository.CategoryTotal,
	categories map[uuid.UUID]*entity.Category,
	transactionType vo.TransactionType,
) dto.CategoryDistributionOutput {
	filtered := make([]repository.CategoryTotal, 0, len(totals))
	total := vo.ZeroMoney

	for _, item := range totals {
		if item.Type != transactionType || !item.Total.IsPositive() {
			continue
		}
		filtered = append(filtered, item)
		total = total.Add(item.Total)
	}

	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].Total.GreaterThan(filtered[j].Total)
	})

	slices := make([]dto.CategorySliceOutput, 0, len(filtered))
	for _, item := range filtered {
		slice := dto.CategorySliceOutput{
			CategoryID: item.CategoryID.String(),
			Name:       "Sem categoria",
			Color:      "#94A3B8",
			Icon:       "tag",
			Total:      dto.ToMoneyOutput(item.Total),
			Percentage: item.Total.PercentageOf(total),
			Count:      item.Count,
		}
		if category, ok := categories[item.CategoryID]; ok {
			slice.Name = category.Name
			slice.Color = category.Color
			slice.Icon = category.Icon
		}
		slices = append(slices, slice)
	}

	return dto.CategoryDistributionOutput{Total: dto.ToMoneyOutput(total), Slices: slices}
}

// loadCategoryIndex carrega as categorias do usuario indexadas por id.
func loadCategoryIndex(ctx context.Context, userID uuid.UUID, categories repository.CategoryRepository) (map[uuid.UUID]*entity.Category, error) {
	list, err := categories.ListByUser(ctx, userID, nil, true)
	if err != nil {
		return nil, err
	}

	index := make(map[uuid.UUID]*entity.Category, len(list))
	for _, category := range list {
		index[category.ID] = category
	}
	return index, nil
}
