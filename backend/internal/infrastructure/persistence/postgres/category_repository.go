package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

const categoryNotFoundCode = "category_not_found"
const categoryNotFoundMessage = "categoria nao encontrada"

// CategoryRepository persiste categorias no PostgreSQL.
type CategoryRepository struct {
	db *pgxpool.Pool
}

// NewCategoryRepository cria o repositorio.
func NewCategoryRepository(db *pgxpool.Pool) repository.CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(ctx context.Context, category *entity.Category) error {
	const query = `
		INSERT INTO categories (id, user_id, name, type, color, icon, archived, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	_, err := r.db.Exec(ctx, query,
		category.ID, category.UserID, category.Name, category.Type.String(),
		category.Color, category.Icon, category.Archived, category.CreatedAt, category.UpdatedAt)
	return translateError(err, categoryNotFoundCode, categoryNotFoundMessage)
}

func (r *CategoryRepository) Update(ctx context.Context, category *entity.Category) error {
	const query = `
		UPDATE categories
		SET name = $3, type = $4, color = $5, icon = $6, archived = $7, updated_at = $8
		WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query,
		category.ID, category.UserID, category.Name, category.Type.String(),
		category.Color, category.Icon, category.Archived, category.UpdatedAt)
	if err != nil {
		return translateError(err, categoryNotFoundCode, categoryNotFoundMessage)
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, categoryNotFoundCode, categoryNotFoundMessage)
	}
	return nil
}

func (r *CategoryRepository) Delete(ctx context.Context, userID, id uuid.UUID) error {
	const query = `DELETE FROM categories WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query, id, userID)
	if err != nil {
		return translateError(err, categoryNotFoundCode, categoryNotFoundMessage)
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, categoryNotFoundCode, categoryNotFoundMessage)
	}
	return nil
}

func (r *CategoryRepository) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Category, error) {
	const query = `
		SELECT id, user_id, name, type, color, icon, archived, created_at, updated_at
		FROM categories WHERE id = $1 AND user_id = $2`

	rows, err := r.db.Query(ctx, query, id, userID)
	if err != nil {
		return nil, translateError(err, categoryNotFoundCode, categoryNotFoundMessage)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, translateError(errNoRows, categoryNotFoundCode, categoryNotFoundMessage)
	}
	return scanCategory(rows)
}

func (r *CategoryRepository) ListByUser(
	ctx context.Context,
	userID uuid.UUID,
	categoryType *vo.TransactionType,
	includeArchived bool,
) ([]*entity.Category, error) {
	const query = `
		SELECT id, user_id, name, type, color, icon, archived, created_at, updated_at
		FROM categories
		WHERE user_id = $1
		  AND ($2::bool OR NOT archived)
		  AND ($3::text IS NULL OR type = $3::text)
		ORDER BY archived, name`

	var rawType *string
	if categoryType != nil {
		value := categoryType.String()
		rawType = &value
	}

	rows, err := r.db.Query(ctx, query, userID, includeArchived, rawType)
	if err != nil {
		return nil, translateError(err, categoryNotFoundCode, categoryNotFoundMessage)
	}
	defer rows.Close()

	categories := make([]*entity.Category, 0)
	for rows.Next() {
		category, err := scanCategory(rows)
		if err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, translateError(rows.Err(), categoryNotFoundCode, categoryNotFoundMessage)
}

func (r *CategoryRepository) CountTransactions(ctx context.Context, userID, categoryID uuid.UUID) (int, error) {
	const query = `SELECT count(*) FROM transactions WHERE user_id = $1 AND category_id = $2`

	var count int
	if err := r.db.QueryRow(ctx, query, userID, categoryID).Scan(&count); err != nil {
		return 0, translateError(err, categoryNotFoundCode, categoryNotFoundMessage)
	}
	return count, nil
}

func scanCategory(rows pgx.Rows) (*entity.Category, error) {
	var (
		category entity.Category
		rawType  string
	)

	if err := rows.Scan(
		&category.ID, &category.UserID, &category.Name, &rawType,
		&category.Color, &category.Icon, &category.Archived, &category.CreatedAt, &category.UpdatedAt,
	); err != nil {
		return nil, translateError(err, categoryNotFoundCode, categoryNotFoundMessage)
	}

	category.Type = vo.TransactionType(rawType)
	return &category, nil
}
