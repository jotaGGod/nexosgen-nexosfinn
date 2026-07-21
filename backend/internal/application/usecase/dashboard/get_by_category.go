package dashboard

import (
	"context"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
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
	totals, err := uc.analytics.TotalsByCategory(ctx, userID, period)
	if err != nil {
		return dto.CategoryDistributionOutput{}, err
	}

	categoryIndex, err := loadCategoryIndex(ctx, userID, uc.categories)
	if err != nil {
		return dto.CategoryDistributionOutput{}, err
	}

	return buildDistribution(totals, categoryIndex, transactionType), nil
}
