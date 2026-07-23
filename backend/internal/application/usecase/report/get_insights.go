package report

import (
	"context"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/application/parallel"
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

	var (
		categoryIndex      map[uuid.UUID]*entity.Category
		highest            *entity.Transaction
		lowest             *entity.Transaction
		currentByCategory  []repository.CategoryTotal
		previousByCategory []repository.CategoryTotal
		dailySeries        []repository.DailyTotal
	)

	err := parallel.Run(ctx,
		func(taskCtx context.Context) (taskErr error) {
			categoryIndex, taskErr = loadCategoryIndex(taskCtx, userID, uc.categories)
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			highest, lowest, taskErr = uc.analytics.Extremes(taskCtx, userID, period, vo.TransactionTypeExpense)
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			currentByCategory, taskErr = uc.analytics.TotalsByCategory(taskCtx, userID, period)
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			previousByCategory, taskErr = uc.analytics.TotalsByCategory(taskCtx, userID, period.Previous())
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			dailySeries, taskErr = uc.analytics.DailySeries(taskCtx, userID, period)
			return taskErr
		},
	)
	if err != nil {
		return insights, err
	}

	insights.BiggestExpense = toHighlight(highest, categoryIndex)
	insights.SmallestExpense = toHighlight(lowest, categoryIndex)

	if trend := service.TrendingCategory(currentByCategory, previousByCategory); trend != nil {
		insights.TrendingCategory = &dto.TrendingCategoryOutput{
			Category:  dto.ToCategoryRefOutput(categoryIndex[trend.CategoryID]),
			Current:   dto.ToMoneyOutput(trend.Current),
			Previous:  dto.ToMoneyOutput(trend.Previous),
			Variation: trend.Variation,
		}
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
