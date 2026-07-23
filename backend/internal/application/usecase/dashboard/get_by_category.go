package dashboard

import (
	"context"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/application/parallel"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// GetByCategoryUseCase monta o grafico de rosca de gastos por categoria.
type GetByCategoryUseCase struct {
	categories repository.CategoryRepository
	analytics  repository.TransactionAnalyticsRepository
}

// NewGetByCategoryUseCase monta o caso de uso com suas dependencias.
func NewGetByCategoryUseCase(
	categories repository.CategoryRepository,
	analytics repository.TransactionAnalyticsRepository,
) *GetByCategoryUseCase {
	return &GetByCategoryUseCase{categories: categories, analytics: analytics}
}

// Execute agrega os totais por categoria do tipo informado no periodo.
func (uc *GetByCategoryUseCase) Execute(
	ctx context.Context,
	userID uuid.UUID,
	period vo.Period,
	transactionType vo.TransactionType,
) (dto.CategoryDistributionOutput, error) {
	totals, categoryIndex, err := uc.load(ctx, userID, period)
	if err != nil {
		return dto.CategoryDistributionOutput{}, err
	}

	return buildDistribution(totals, categoryIndex, transactionType), nil
}

// ExecuteBoth monta receitas e despesas com uma unica leitura dos totais e
// das categorias. A tela de relatorios precisa das duas distribuicoes e antes
// repetia exatamente as mesmas consultas.
func (uc *GetByCategoryUseCase) ExecuteBoth(
	ctx context.Context,
	userID uuid.UUID,
	period vo.Period,
) (dto.CategoryDistributionOutput, dto.CategoryDistributionOutput, error) {
	totals, categoryIndex, err := uc.load(ctx, userID, period)
	if err != nil {
		return dto.CategoryDistributionOutput{}, dto.CategoryDistributionOutput{}, err
	}

	expenses := buildDistribution(totals, categoryIndex, vo.TransactionTypeExpense)
	incomes := buildDistribution(totals, categoryIndex, vo.TransactionTypeIncome)
	return expenses, incomes, nil
}

func (uc *GetByCategoryUseCase) load(
	ctx context.Context,
	userID uuid.UUID,
	period vo.Period,
) ([]repository.CategoryTotal, map[uuid.UUID]*entity.Category, error) {
	var (
		totals        []repository.CategoryTotal
		categoryIndex map[uuid.UUID]*entity.Category
	)

	err := parallel.Run(ctx,
		func(taskCtx context.Context) (taskErr error) {
			totals, taskErr = uc.analytics.TotalsByCategory(taskCtx, userID, period)
			return taskErr
		},
		func(taskCtx context.Context) (taskErr error) {
			categoryIndex, taskErr = loadCategoryIndex(taskCtx, userID, uc.categories)
			return taskErr
		},
	)
	return totals, categoryIndex, err
}
