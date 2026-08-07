package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

const budgetNotFoundCode = "budget_not_found"
const budgetNotFoundMessage = "orcamento nao encontrado"

// BudgetRepository persiste orcamentos mensais no PostgreSQL.
type BudgetRepository struct {
	db *pgxpool.Pool
}

// NewBudgetRepository cria o repositorio.
func NewBudgetRepository(db *pgxpool.Pool) repository.BudgetRepository {
	return &BudgetRepository{db: db}
}

func (r *BudgetRepository) Create(ctx context.Context, budget *entity.Budget) error {
	const query = `
		INSERT INTO budgets (id, user_id, category_id, month, limit_amount, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := r.db.Exec(ctx, query,
		budget.ID, budget.UserID, budget.CategoryID, budget.Month,
		budget.LimitAmount.Cents(), budget.CreatedAt, budget.UpdatedAt)
	return translateError(err, budgetNotFoundCode, budgetNotFoundMessage)
}

func (r *BudgetRepository) Update(ctx context.Context, budget *entity.Budget) error {
	const query = `
		UPDATE budgets SET limit_amount = $3, updated_at = $4
		WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query, budget.ID, budget.UserID, budget.LimitAmount.Cents(), budget.UpdatedAt)
	if err != nil {
		return translateError(err, budgetNotFoundCode, budgetNotFoundMessage)
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, budgetNotFoundCode, budgetNotFoundMessage)
	}
	return nil
}

func (r *BudgetRepository) Delete(ctx context.Context, userID, id uuid.UUID) error {
	const query = `DELETE FROM budgets WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query, id, userID)
	if err != nil {
		return translateError(err, budgetNotFoundCode, budgetNotFoundMessage)
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, budgetNotFoundCode, budgetNotFoundMessage)
	}
	return nil
}

func (r *BudgetRepository) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Budget, error) {
	const query = `
		SELECT id, user_id, category_id, month, limit_amount, created_at, updated_at
		FROM budgets WHERE id = $1 AND user_id = $2`

	rows, err := r.db.Query(ctx, query, id, userID)
	if err != nil {
		return nil, translateError(err, budgetNotFoundCode, budgetNotFoundMessage)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, translateError(errNoRows, budgetNotFoundCode, budgetNotFoundMessage)
	}
	return scanBudget(rows)
}

func (r *BudgetRepository) FindByCategoryAndMonth(
	ctx context.Context,
	userID, categoryID uuid.UUID,
	month time.Time,
) (*entity.Budget, error) {
	const query = `
		SELECT id, user_id, category_id, month, limit_amount, created_at, updated_at
		FROM budgets WHERE user_id = $1 AND category_id = $2 AND month = $3`

	rows, err := r.db.Query(ctx, query, userID, categoryID, entity.NormalizeMonth(month))
	if err != nil {
		return nil, translateError(err, budgetNotFoundCode, budgetNotFoundMessage)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, translateError(errNoRows, budgetNotFoundCode, budgetNotFoundMessage)
	}
	return scanBudget(rows)
}

func (r *BudgetRepository) ListByMonth(ctx context.Context, userID uuid.UUID, month time.Time) ([]*entity.Budget, error) {
	const query = `
		SELECT id, user_id, category_id, month, limit_amount, created_at, updated_at
		FROM budgets WHERE user_id = $1 AND month = $2
		ORDER BY created_at`

	rows, err := r.db.Query(ctx, query, userID, entity.NormalizeMonth(month))
	if err != nil {
		return nil, translateError(err, budgetNotFoundCode, budgetNotFoundMessage)
	}
	defer rows.Close()

	budgets := make([]*entity.Budget, 0)
	for rows.Next() {
		budget, err := scanBudget(rows)
		if err != nil {
			return nil, err
		}
		budgets = append(budgets, budget)
	}
	return budgets, translateError(rows.Err(), budgetNotFoundCode, budgetNotFoundMessage)
}

func scanBudget(rows pgx.Rows) (*entity.Budget, error) {
	var (
		budget entity.Budget
		limit  int64
	)

	if err := rows.Scan(
		&budget.ID, &budget.UserID, &budget.CategoryID, &budget.Month,
		&limit, &budget.CreatedAt, &budget.UpdatedAt,
	); err != nil {
		return nil, translateError(err, budgetNotFoundCode, budgetNotFoundMessage)
	}

	budget.Month = entity.NormalizeMonth(budget.Month)
	budget.LimitAmount = vo.NewMoney(limit)
	return &budget, nil
}
