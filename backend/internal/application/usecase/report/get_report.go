package report

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/application/parallel"
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

	var (
		overview dto.ReportOverviewOutput
		cashflow []dto.CashflowPointOutput
		expenses dto.CategoryDistributionOutput
		incomes  dto.CategoryDistributionOutput
		insights dto.ReportInsightsOutput
	)

	err = parallel.Run(ctx,
		func(taskCtx context.Context) (taskErr error) {
			overview, taskErr = uc.overview.Execute(taskCtx, userID, period)
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			cashflow, taskErr = uc.cashflow.Execute(taskCtx, userID, period.End(), months)
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			expenses, incomes, taskErr = uc.byCategory.ExecuteBoth(taskCtx, userID, period)
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			insights, taskErr = uc.insights.Execute(taskCtx, userID, period)
			return taskErr
		},
	)
	if err != nil {
		return nil, err
	}
	trends := TrendsFromCashflow(cashflow)

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
