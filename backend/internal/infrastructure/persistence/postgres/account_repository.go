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

const accountNotFoundCode = "account_not_found"
const accountNotFoundMessage = "conta nao encontrada"

// AccountRepository persiste contas financeiras no PostgreSQL.
type AccountRepository struct {
	db *pgxpool.Pool
}

// NewAccountRepository cria o repositorio.
func NewAccountRepository(db *pgxpool.Pool) repository.AccountRepository {
	return &AccountRepository{db: db}
}

func (r *AccountRepository) Create(ctx context.Context, account *entity.Account) error {
	const query = `
		INSERT INTO accounts (id, user_id, name, type, initial_balance, color, icon, archived, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err := r.db.Exec(ctx, query,
		account.ID, account.UserID, account.Name, account.Type.String(), account.InitialBalance.Cents(),
		account.Color, account.Icon, account.Archived, account.CreatedAt, account.UpdatedAt)
	return translateError(err, accountNotFoundCode, accountNotFoundMessage)
}

func (r *AccountRepository) Update(ctx context.Context, account *entity.Account) error {
	const query = `
		UPDATE accounts
		SET name = $3, type = $4, initial_balance = $5, color = $6, icon = $7, archived = $8, updated_at = $9
		WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query,
		account.ID, account.UserID, account.Name, account.Type.String(), account.InitialBalance.Cents(),
		account.Color, account.Icon, account.Archived, account.UpdatedAt)
	if err != nil {
		return translateError(err, accountNotFoundCode, accountNotFoundMessage)
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, accountNotFoundCode, accountNotFoundMessage)
	}
	return nil
}

func (r *AccountRepository) Delete(ctx context.Context, userID, id uuid.UUID) error {
	const query = `DELETE FROM accounts WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query, id, userID)
	if err != nil {
		return translateError(err, accountNotFoundCode, accountNotFoundMessage)
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, accountNotFoundCode, accountNotFoundMessage)
	}
	return nil
}

func (r *AccountRepository) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Account, error) {
	const query = `
		SELECT id, user_id, name, type, initial_balance, color, icon, archived, created_at, updated_at
		FROM accounts WHERE id = $1 AND user_id = $2`

	rows, err := r.db.Query(ctx, query, id, userID)
	if err != nil {
		return nil, translateError(err, accountNotFoundCode, accountNotFoundMessage)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, translateError(errNoRows, accountNotFoundCode, accountNotFoundMessage)
	}
	return scanAccount(rows)
}

func (r *AccountRepository) ListByUser(ctx context.Context, userID uuid.UUID, includeArchived bool) ([]*entity.Account, error) {
	const query = `
		SELECT id, user_id, name, type, initial_balance, color, icon, archived, created_at, updated_at
		FROM accounts
		WHERE user_id = $1 AND ($2::bool OR NOT archived)
		ORDER BY archived, name`

	rows, err := r.db.Query(ctx, query, userID, includeArchived)
	if err != nil {
		return nil, translateError(err, accountNotFoundCode, accountNotFoundMessage)
	}
	defer rows.Close()

	accounts := make([]*entity.Account, 0)
	for rows.Next() {
		account, err := scanAccount(rows)
		if err != nil {
			return nil, err
		}
		accounts = append(accounts, account)
	}
	return accounts, translateError(rows.Err(), accountNotFoundCode, accountNotFoundMessage)
}

func (r *AccountRepository) CountTransactions(ctx context.Context, userID, accountID uuid.UUID) (int, error) {
	const query = `SELECT count(*) FROM transactions WHERE user_id = $1 AND account_id = $2`

	var count int
	if err := r.db.QueryRow(ctx, query, userID, accountID).Scan(&count); err != nil {
		return 0, translateError(err, accountNotFoundCode, accountNotFoundMessage)
	}
	return count, nil
}

func scanAccount(rows pgx.Rows) (*entity.Account, error) {
	var (
		account        entity.Account
		rawType        string
		initialBalance int64
	)

	if err := rows.Scan(
		&account.ID, &account.UserID, &account.Name, &rawType, &initialBalance,
		&account.Color, &account.Icon, &account.Archived, &account.CreatedAt, &account.UpdatedAt,
	); err != nil {
		return nil, translateError(err, accountNotFoundCode, accountNotFoundMessage)
	}

	account.Type = vo.AccountType(rawType)
	account.InitialBalance = vo.NewMoney(initialBalance)
	return &account, nil
}
