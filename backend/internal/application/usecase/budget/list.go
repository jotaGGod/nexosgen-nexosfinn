package budget

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/service"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

// ListUseCase devolve os orcamentos de um mes com o consumo apurado.
type ListUseCase struct {
	budgets    repository.BudgetRepository
	categories repository.CategoryRepository
	analytics  repository.TransactionAnalyticsRepository
}

// NewListUseCase monta o caso de uso com suas dependencias.
func NewListUseCase(
	budgets repository.BudgetRepository,
	categories repository.CategoryRepository,
	analytics repository.TransactionAnalyticsRepository,
) *ListUseCase {
	return &ListUseCase{budgets: budgets, categories: categories, analytics: analytics}
}

// Execute lista os orcamentos do mes, cruzando limite e gasto em uma unica
// consulta agregada.
func (uc *ListUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.ListBudgetsInput) (*dto.BudgetListOutput, error) {
	month := time.Now().UTC()
	if input.Month != "" {
		parsed, err := dto.ParseDate(input.Month, "mes")
		if err != nil {
			return nil, err
		}
		month = parsed
	}
	month = entity.NormalizeMonth(month)

	found, err := uc.budgets.ListByMonth(ctx, userID, month)
	if err != nil {
		return nil, err
	}

	categoryList, err := uc.categories.ListByUser(ctx, userID, nil, true)
	if err != nil {
		return nil, err
	}
	categoriesByID := make(map[uuid.UUID]*entity.Category, len(categoryList))
	for _, category := range categoryList {
		categoriesByID[category.ID] = category
	}

	spent, err := spentByCategory(ctx, userID, month, uc.analytics)
	if err != nil {
		return nil, err
	}

	items := make([]dto.BudgetOutput, 0, len(found))
	totalLimit, totalSpent := vo.ZeroMoney, vo.ZeroMoney

	for _, item := range found {
		consumption := service.CalculateBudgetConsumption(item.LimitAmount, spent[item.CategoryID])
		items = append(items, dto.ToBudgetOutput(item, categoriesByID[item.CategoryID], consumption))

		totalLimit = totalLimit.Add(consumption.Limit)
		totalSpent = totalSpent.Add(consumption.Spent)
	}

	return &dto.BudgetListOutput{
		Month:      dto.FormatDate(month),
		Items:      items,
		TotalLimit: dto.ToMoneyOutput(totalLimit),
		TotalSpent: dto.ToMoneyOutput(totalSpent),
		Percentage: totalSpent.PercentageOf(totalLimit),
	}, nil
}
