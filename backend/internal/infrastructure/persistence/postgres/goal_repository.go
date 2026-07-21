package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

const goalNotFoundCode = "goal_not_found"
const goalNotFoundMessage = "meta nao encontrada"

// GoalRepository persiste metas financeiras no PostgreSQL.
type GoalRepository struct {
	db *pgxpool.Pool
}

// NewGoalRepository cria o repositorio.
func NewGoalRepository(db *pgxpool.Pool) repository.GoalRepository {
	return &GoalRepository{db: db}
}

func (r *GoalRepository) Create(ctx context.Context, goal *entity.Goal) error {
	const query = `
		INSERT INTO goals
			(id, user_id, name, target_amount, current_amount, deadline, image_url, icon, color, archived, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`

	_, err := r.db.Exec(ctx, query,
		goal.ID, goal.UserID, goal.Name, goal.TargetAmount.Cents(), goal.CurrentAmount.Cents(),
		goal.Deadline, goal.ImageURL, goal.Icon, goal.Color, goal.Archived, goal.CreatedAt, goal.UpdatedAt)
	return translateError(err, goalNotFoundCode, goalNotFoundMessage)
}

func (r *GoalRepository) Update(ctx context.Context, goal *entity.Goal) error {
	const query = `
		UPDATE goals
		SET name = $3, target_amount = $4, current_amount = $5, deadline = $6,
		    image_url = $7, icon = $8, color = $9, archived = $10, updated_at = $11
		WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query,
		goal.ID, goal.UserID, goal.Name, goal.TargetAmount.Cents(), goal.CurrentAmount.Cents(),
		goal.Deadline, goal.ImageURL, goal.Icon, goal.Color, goal.Archived, goal.UpdatedAt)
	if err != nil {
		return translateError(err, goalNotFoundCode, goalNotFoundMessage)
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, goalNotFoundCode, goalNotFoundMessage)
	}
	return nil
}

func (r *GoalRepository) Delete(ctx context.Context, userID, id uuid.UUID) error {
	const query = `DELETE FROM goals WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query, id, userID)
	if err != nil {
		return translateError(err, goalNotFoundCode, goalNotFoundMessage)
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, goalNotFoundCode, goalNotFoundMessage)
	}
	return nil
}

func (r *GoalRepository) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Goal, error) {
	const query = `
		SELECT id, user_id, name, target_amount, current_amount, deadline, image_url, icon, color, archived, created_at, updated_at
		FROM goals WHERE id = $1 AND user_id = $2`

	rows, err := r.db.Query(ctx, query, id, userID)
	if err != nil {
		return nil, translateError(err, goalNotFoundCode, goalNotFoundMessage)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, translateError(errNoRows, goalNotFoundCode, goalNotFoundMessage)
	}
	return scanGoal(rows)
}

func (r *GoalRepository) ListByUser(ctx context.Context, userID uuid.UUID, includeArchived bool) ([]*entity.Goal, error) {
	const query = `
		SELECT id, user_id, name, target_amount, current_amount, deadline, image_url, icon, color, archived, created_at, updated_at
		FROM goals
		WHERE user_id = $1 AND ($2::bool OR NOT archived)
		ORDER BY archived, deadline NULLS LAST, created_at`

	rows, err := r.db.Query(ctx, query, userID, includeArchived)
	if err != nil {
		return nil, translateError(err, goalNotFoundCode, goalNotFoundMessage)
	}
	defer rows.Close()

	goals := make([]*entity.Goal, 0)
	for rows.Next() {
		goal, err := scanGoal(rows)
		if err != nil {
			return nil, err
		}
		goals = append(goals, goal)
	}
	return goals, translateError(rows.Err(), goalNotFoundCode, goalNotFoundMessage)
}

func scanGoal(rows pgx.Rows) (*entity.Goal, error) {
	var (
		goal     entity.Goal
		target   int64
		current  int64
		deadline *time.Time
	)

	if err := rows.Scan(
		&goal.ID, &goal.UserID, &goal.Name, &target, &current, &deadline,
		&goal.ImageURL, &goal.Icon, &goal.Color, &goal.Archived, &goal.CreatedAt, &goal.UpdatedAt,
	); err != nil {
		return nil, translateError(err, goalNotFoundCode, goalNotFoundMessage)
	}

	goal.TargetAmount = vo.NewMoney(target)
	goal.CurrentAmount = vo.NewMoney(current)
	if deadline != nil {
		truncated := vo.TruncateToDay(*deadline)
		goal.Deadline = &truncated
	}
	return &goal, nil
}
