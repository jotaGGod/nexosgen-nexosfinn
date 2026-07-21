package report

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/application/usecase/dashboard"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	"github.com/jacks/finapp/backend/internal/domain/service"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// defaultTrendMonths e a janela padrao das abas de fluxo de caixa e tendencias.
const defaultTrendMonths = 6

// GetReportUseCase compoe a tela de relatorios inteira.
type GetReportUseCase struct {
	overview   *GetOverviewUseCase
	trends     *GetTrendsUseCase
	insights   *GetInsightsUseCase
	cashflow   *dashboard.GetCashflowUseCase
	byCategory *dashboard.GetByCategoryUseCase
}

// NewGetReportUseCase monta o caso de uso com suas dependencias.
func NewGetReportUseCase(
	overview *GetOverviewUseCase,
	trends *GetTrendsUseCase,
	insights *GetInsightsUseCase,
	cashflow *dashboard.GetCashflowUseCase,
	byCategory *dashboard.GetByCategoryUseCase,
) *GetReportUseCase {
	return &GetReportUseCase{
		overview:   overview,
		trends:     trends,
		insights:   insights,
		cashflow:   cashflow,
		byCategory: byCategory,
	}
}

// Execute monta visao geral, fluxo de caixa, distribuicao por categoria,
// tendencias e insights do periodo.
func (uc *GetReportUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.ReportInput) (*dto.ReportOutput, error) {
	period, err := input.Period.Resolve(time.Now().UTC())
	if err != nil {
		return nil, err
	}

	months := input.TrendMonths
	if months < 1 {
		months = defaultTrendMonths
	}

	overview, err := uc.overview.Execute(ctx, userID, period)
	if err != nil {
		return nil, err
	}

	cashflow, err := uc.cashflow.Execute(ctx, userID, period.End(), months)
	if err != nil {
		return nil, err
	}

	expenses, err := uc.byCategory.Execute(ctx, userID, period, vo.TransactionTypeExpense)
	if err != nil {
		return nil, err
	}
	incomes, err := uc.byCategory.Execute(ctx, userID, period, vo.TransactionTypeIncome)
	if err != nil {
		return nil, err
	}

	trends, err := uc.trends.Execute(ctx, userID, period.End(), months)
	if err != nil {
		return nil, err
	}

	insights, err := uc.insights.Execute(ctx, userID, period)
	if err != nil {
		return nil, err
	}

	return &dto.ReportOutput{
		Period:           dto.ToPeriodOutput(period),
		Overview:         overview,
		Cashflow:         cashflow,
		CategoryExpenses: expenses,
		CategoryIncomes:  incomes,
		Trends:           trends,
		Insights:         insights,
		ComparisonPeriod: dto.ToPeriodOutput(period.Previous()),
	}, nil
}

// savingsRate expõe o calculo do dominio para a serie de tendencias.
func savingsRate(income, expense vo.Money) float64 {
	return service.SavingsRate(income, expense)
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
