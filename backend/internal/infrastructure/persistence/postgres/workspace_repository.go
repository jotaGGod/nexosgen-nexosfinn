package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
)

// WorkspaceRepository reinicia todos os dados financeiros dentro de uma transacao.
type WorkspaceRepository struct {
	db *pgxpool.Pool
}

// NewWorkspaceRepository cria o repositorio.
func NewWorkspaceRepository(db *pgxpool.Pool) repository.WorkspaceRepository {
	return &WorkspaceRepository{db: db}
}

// Reset preserva usuario, sessoes e chaves de API. O bloqueio do usuario
// serializa o reset com operacoes concorrentes que dependam da mesma FK.
func (r *WorkspaceRepository) Reset(
	ctx context.Context,
	userID uuid.UUID,
	categories []*entity.Category,
	account *entity.Account,
) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return translateError(err, "user_not_found", "usuario nao encontrado")
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var lockedUserID uuid.UUID
	if err := tx.QueryRow(ctx, `SELECT id FROM users WHERE id = $1 FOR UPDATE`, userID).Scan(&lockedUserID); err != nil {
		return translateError(err, "user_not_found", "usuario nao encontrado")
	}

	for _, query := range []string{
		`DELETE FROM transactions WHERE user_id = $1`,
		`DELETE FROM budgets WHERE user_id = $1`,
		`DELETE FROM goals WHERE user_id = $1`,
		`DELETE FROM categories WHERE user_id = $1`,
		`DELETE FROM accounts WHERE user_id = $1`,
	} {
		if _, err := tx.Exec(ctx, query, userID); err != nil {
			return translateError(err, "user_not_found", "usuario nao encontrado")
		}
	}

	const insertCategory = `
		INSERT INTO categories (id, user_id, name, type, color, icon, archived, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	for _, category := range categories {
		if _, err := tx.Exec(ctx, insertCategory,
			category.ID, userID, category.Name, category.Type.String(), category.Color,
			category.Icon, category.Archived, category.CreatedAt, category.UpdatedAt,
		); err != nil {
			return translateError(err, "category_not_found", "categoria nao encontrada")
		}
	}

	const insertAccount = `
		INSERT INTO accounts (id, user_id, name, type, initial_balance, color, icon, archived, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	if _, err := tx.Exec(ctx, insertAccount,
		account.ID, userID, account.Name, account.Type.String(), account.InitialBalance.Cents(),
		account.Color, account.Icon, account.Archived, account.CreatedAt, account.UpdatedAt,
	); err != nil {
		return translateError(err, "account_not_found", "conta nao encontrada")
	}

	if err := tx.Commit(ctx); err != nil {
		return translateError(err, "user_not_found", "usuario nao encontrado")
	}
	return nil
}
