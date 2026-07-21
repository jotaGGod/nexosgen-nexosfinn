package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

const transactionNotFoundCode = "transaction_not_found"
const transactionNotFoundMessage = "lancamento nao encontrado"

// TransactionRepository persiste lancamentos no PostgreSQL.
type TransactionRepository struct {
	db *pgxpool.Pool
}

// NewTransactionRepository cria o repositorio.
func NewTransactionRepository(db *pgxpool.Pool) repository.TransactionRepository {
	return &TransactionRepository{db: db}
}

func (r *TransactionRepository) Create(ctx context.Context, transaction *entity.Transaction) error {
	const query = `
		INSERT INTO transactions
			(id, user_id, account_id, category_id, type, amount, description, notes, occurred_on, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

	_, err := r.db.Exec(ctx, query,
		transaction.ID, transaction.UserID, transaction.AccountID, transaction.CategoryID,
		transaction.Type.String(), transaction.Amount.Cents(), transaction.Description,
		transaction.Notes, transaction.OccurredOn, transaction.CreatedAt, transaction.UpdatedAt)
	return translateError(err, transactionNotFoundCode, transactionNotFoundMessage)
}

func (r *TransactionRepository) Update(ctx context.Context, transaction *entity.Transaction) error {
	const query = `
		UPDATE transactions
		SET account_id = $3, category_id = $4, type = $5, amount = $6,
		    description = $7, notes = $8, occurred_on = $9, updated_at = $10
		WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query,
		transaction.ID, transaction.UserID, transaction.AccountID, transaction.CategoryID,
		transaction.Type.String(), transaction.Amount.Cents(), transaction.Description,
		transaction.Notes, transaction.OccurredOn, transaction.UpdatedAt)
	if err != nil {
		return translateError(err, transactionNotFoundCode, transactionNotFoundMessage)
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, transactionNotFoundCode, transactionNotFoundMessage)
	}
	return nil
}

func (r *TransactionRepository) Delete(ctx context.Context, userID, id uuid.UUID) error {
	const query = `DELETE FROM transactions WHERE id = $1 AND user_id = $2`

	tag, err := r.db.Exec(ctx, query, id, userID)
	if err != nil {
		return translateError(err, transactionNotFoundCode, transactionNotFoundMessage)
	}
	if tag.RowsAffected() == 0 {
		return translateError(errNoRows, transactionNotFoundCode, transactionNotFoundMessage)
	}
	return nil
}

func (r *TransactionRepository) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Transaction, error) {
	const query = `
		SELECT id, user_id, account_id, category_id, type, amount, description, notes, occurred_on, created_at, updated_at
		FROM transactions WHERE id = $1 AND user_id = $2`

	rows, err := r.db.Query(ctx, query, id, userID)
	if err != nil {
		return nil, translateError(err, transactionNotFoundCode, transactionNotFoundMessage)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, translateError(errNoRows, transactionNotFoundCode, transactionNotFoundMessage)
	}
	return scanTransaction(rows)
}

func (r *TransactionRepository) List(ctx context.Context, filter repository.TransactionFilter) (repository.TransactionPage, error) {
	where, args := buildWhere(filter)

	countQuery := "SELECT count(*) FROM transactions " + where
	var total int
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return repository.TransactionPage{}, translateError(err, transactionNotFoundCode, transactionNotFoundMessage)
	}

	query := fmt.Sprintf(`
		SELECT id, user_id, account_id, category_id, type, amount, description, notes, occurred_on, created_at, updated_at
		FROM transactions %s
		ORDER BY %s
		LIMIT $%d OFFSET $%d`,
		where, orderBy(filter), len(args)+1, len(args)+2)

	args = append(args, filter.PageSize, (filter.Page-1)*filter.PageSize)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return repository.TransactionPage{}, translateError(err, transactionNotFoundCode, transactionNotFoundMessage)
	}
	defer rows.Close()

	items := make([]*entity.Transaction, 0, filter.PageSize)
	for rows.Next() {
		transaction, err := scanTransaction(rows)
		if err != nil {
			return repository.TransactionPage{}, err
		}
		items = append(items, transaction)
	}
	if err := rows.Err(); err != nil {
		return repository.TransactionPage{}, translateError(err, transactionNotFoundCode, transactionNotFoundMessage)
	}

	return repository.TransactionPage{
		Items:    items,
		Total:    total,
		Page:     filter.Page,
		PageSize: filter.PageSize,
	}, nil
}

func (r *TransactionRepository) FilterTotals(ctx context.Context, filter repository.TransactionFilter) (repository.Totals, error) {
	where, args := buildWhere(filter)

	query := `
		SELECT
			COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0),
			COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0),
			count(*)
		FROM transactions ` + where

	var income, expense int64
	var count int

	if err := r.db.QueryRow(ctx, query, args...).Scan(&income, &expense, &count); err != nil {
		return repository.Totals{}, translateError(err, transactionNotFoundCode, transactionNotFoundMessage)
	}

	return repository.Totals{
		Income:  vo.NewMoney(income),
		Expense: vo.NewMoney(expense),
		Count:   count,
	}, nil
}

// buildWhere monta a clausula WHERE e os argumentos posicionais do filtro.
//
// Os valores nunca sao interpolados na string: cada filtro vira um parametro
// $n, o que elimina qualquer superficie de SQL injection.
func buildWhere(filter repository.TransactionFilter) (string, []any) {
	conditions := []string{"user_id = $1"}
	args := []any{filter.UserID}

	if filter.Type != nil {
		args = append(args, filter.Type.String())
		conditions = append(conditions, fmt.Sprintf("type = $%d", len(args)))
	}

	if filter.Period != nil {
		args = append(args, filter.Period.Start())
		conditions = append(conditions, fmt.Sprintf("occurred_on >= $%d", len(args)))
		args = append(args, filter.Period.End())
		conditions = append(conditions, fmt.Sprintf("occurred_on <= $%d", len(args)))
	}

	if search := strings.TrimSpace(filter.Search); search != "" {
		args = append(args, "%"+search+"%")
		conditions = append(conditions, fmt.Sprintf("(description ILIKE $%d OR notes ILIKE $%d)", len(args), len(args)))
	}

	if len(filter.CategoryIDs) > 0 {
		args = append(args, filter.CategoryIDs)
		conditions = append(conditions, fmt.Sprintf("category_id = ANY($%d)", len(args)))
	}

	if len(filter.AccountIDs) > 0 {
		args = append(args, filter.AccountIDs)
		conditions = append(conditions, fmt.Sprintf("account_id = ANY($%d)", len(args)))
	}

	return "WHERE " + strings.Join(conditions, " AND "), args
}

// orderBy traduz a ordenacao pedida para colunas conhecidas.
//
// O valor vem da query string, entao a lista fechada aqui e o que impede que
// ele chegue ao SQL.
func orderBy(filter repository.TransactionFilter) string {
	column := "occurred_on"
	switch filter.SortBy {
	case "amount":
		column = "amount"
	case "description":
		column = "description"
	}

	direction := "DESC"
	if strings.EqualFold(filter.SortDir, "asc") {
		direction = "ASC"
	}

	return fmt.Sprintf("%s %s, created_at %s", column, direction, direction)
}

func scanTransaction(rows pgx.Rows) (*entity.Transaction, error) {
	var (
		transaction entity.Transaction
		rawType     string
		amount      int64
	)

	if err := rows.Scan(
		&transaction.ID, &transaction.UserID, &transaction.AccountID, &transaction.CategoryID,
		&rawType, &amount, &transaction.Description, &transaction.Notes,
		&transaction.OccurredOn, &transaction.CreatedAt, &transaction.UpdatedAt,
	); err != nil {
		return nil, translateError(err, transactionNotFoundCode, transactionNotFoundMessage)
	}

	transaction.Type = vo.TransactionType(rawType)
	transaction.Amount = vo.NewMoney(amount)
	transaction.OccurredOn = vo.TruncateToDay(transaction.OccurredOn)
	return &transaction, nil
}
