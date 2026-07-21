package report

import (
	"context"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	"github.com/jacks/finapp/backend/internal/domain/service"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// GetInsightsUseCase monta os destaques do periodo: maior e menor gasto,
// categoria em alta e melhor dia.
type GetInsightsUseCase struct {
	categories repository.CategoryRepository
	analytics  repository.TransactionAnalyticsRepository
}

// NewGetInsightsUseCase monta o caso de uso com suas dependencias.
func NewGetInsightsUseCase(
	categories repository.CategoryRepository,
	analytics repository.TransactionAnalyticsRepository,
) *GetInsightsUseCase {
	return &GetInsightsUseCase{categories: categories, analytics: analytics}
}

// Execute apura os insights do periodo.
//
// Cada destaque e opcional: um periodo sem movimento devolve todos nulos e a
// interface mostra o estado vazio em vez de zeros enganosos.
func (uc *GetInsightsUseCase) Execute(ctx context.Context, userID uuid.UUID, period vo.Period) (dto.ReportInsightsOutput, error) {
	insights := dto.ReportInsightsOutput{}

	categoryIndex, err := loadCategoryIndex(ctx, userID, uc.categories)
	if err != nil {
		return insights, err
	}

	highest, lowest, err := uc.analytics.Extremes(ctx, userID, period, vo.TransactionTypeExpense)
	if err != nil {
		return insights, err
	}
	insights.BiggestExpense = toHighlight(highest, categoryIndex)
	insights.SmallestExpense = toHighlight(lowest, categoryIndex)

	currentByCategory, err := uc.analytics.TotalsByCategory(ctx, userID, period)
	if err != nil {
		return insights, err
	}
	previousByCategory, err := uc.analytics.TotalsByCategory(ctx, userID, period.Previous())
	if err != nil {
		return insights, err
	}

	if trend := service.TrendingCategory(currentByCategory, previousByCategory); trend != nil {
		insights.TrendingCategory = &dto.TrendingCategoryOutput{
			Category:  dto.ToCategoryRefOutput(categoryIndex[trend.CategoryID]),
			Current:   dto.ToMoneyOutput(trend.Current),
			Previous:  dto.ToMoneyOutput(trend.Previous),
			Variation: trend.Variation,
		}
	}

	dailySeries, err := uc.analytics.DailySeries(ctx, userID, period)
	if err != nil {
		return insights, err
	}
	if best := service.BestDay(dailySeries); best != nil {
		insights.BestDay = &dto.BestDayOutput{
			Date: dto.FormatDate(best.Day),
			Net:  dto.ToMoneyOutput(best.Net),
		}
	}

	return insights, nil
}

func toHighlight(transaction *entity.Transaction, categories map[uuid.UUID]*entity.Category) *dto.TransactionHighlightOutput {
	if transaction == nil {
		return nil
	}
	return &dto.TransactionHighlightOutput{
		Description: transaction.Description,
		Amount:      dto.ToMoneyOutput(transaction.Amount),
		Date:        dto.FormatDate(transaction.OccurredOn),
		Category:    dto.ToCategoryRefOutput(categories[transaction.CategoryID]),
	}
}
