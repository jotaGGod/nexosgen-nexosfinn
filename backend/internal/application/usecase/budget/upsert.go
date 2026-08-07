// Package budget reune os casos de uso de orcamentos mensais por categoria.
package budget

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/service"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/pkg/validator"
)

// UpsertUseCase define ou atualiza o limite de uma categoria em um mes.
//
// A operacao e idempotente por (categoria, mes): a interface tem um unico
// formulario de "definir orcamento", que serve tanto para criar quanto para
// ajustar o limite.
type UpsertUseCase struct {
	budgets    repository.BudgetRepository
	categories repository.CategoryRepository
	analytics  repository.TransactionAnalyticsRepository
}

// NewUpsertUseCase monta o caso de uso com suas dependencias.
func NewUpsertUseCase(
	budgets repository.BudgetRepository,
	categories repository.CategoryRepository,
	analytics repository.TransactionAnalyticsRepository,
) *UpsertUseCase {
	return &UpsertUseCase{budgets: budgets, categories: categories, analytics: analytics}
}

// Execute grava o limite e devolve o consumo ja apurado do mes.
func (uc *UpsertUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.UpsertBudgetInput) (*dto.BudgetOutput, error) {
	v := validator.New()
	categoryID := v.UUID("category_id", input.CategoryID, "categoria")
	v.Positive("limit_amount", input.LimitAmount, "limite")
	if err := v.Error(); err != nil {
		return nil, err
	}

	month := time.Now().UTC()
	if input.Month != "" {
		parsed, err := dto.ParseDate(input.Month, "mes")
		if err != nil {
			return nil, err
		}
		month = parsed
	}
	month = entity.NormalizeMonth(month)

	limitAmount, err := vo.NewMoneyFromReais(input.LimitAmount)
	if err != nil {
		return nil, err
	}

	category, err := uc.categories.FindByID(ctx, userID, categoryID)
	if err != nil {
		if domainerr.Is(err, domainerr.KindNotFound) {
			return nil, domainerr.InvalidInput("category_not_found", "categoria nao encontrada")
		}
		return nil, err
	}

	// Orcamento e teto de gasto: uma categoria de receita nao tem limite a
	// respeitar.
	if !category.Type.IsExpense() {
		return nil, domainerr.InvalidInput(
			"category_must_be_expense",
			"orcamentos so podem ser definidos para categorias de despesa",
		)
	}

	existing, err := uc.budgets.FindByCategoryAndMonth(ctx, userID, categoryID, month)
	switch {
	case err == nil:
		if err := existing.ChangeLimit(limitAmount); err != nil {
			return nil, err
		}
		if err := uc.budgets.Update(ctx, existing); err != nil {
			return nil, err
		}
	case domainerr.Is(err, domainerr.KindNotFound):
		created, createErr := entity.NewBudget(userID, categoryID, month, limitAmount)
		if createErr != nil {
			return nil, createErr
		}
		if createErr := uc.budgets.Create(ctx, created); createErr != nil {
			return nil, createErr
		}
		existing = created
	default:
		return nil, err
	}

	spent, err := spentByCategory(ctx, userID, month, uc.analytics)
	if err != nil {
		return nil, err
	}

	consumption := service.CalculateBudgetConsumption(existing.LimitAmount, spent[categoryID])
	output := dto.ToBudgetOutput(existing, category, consumption)
	return &output, nil
}

// spentByCategory apura o gasto de cada categoria no mes de referencia.
func spentByCategory(
	ctx context.Context,
	userID uuid.UUID,
	month time.Time,
	analytics repository.TransactionAnalyticsRepository,
) (map[uuid.UUID]vo.Money, error) {
	totals, err := analytics.TotalsByCategory(ctx, userID, vo.NewMonthPeriod(month))
	if err != nil {
		return nil, err
	}

	spent := make(map[uuid.UUID]vo.Money, len(totals))
	for _, total := range totals {
		if total.Type.IsExpense() {
			spent[total.CategoryID] = total.Total
		}
	}
	return spent, nil
}
