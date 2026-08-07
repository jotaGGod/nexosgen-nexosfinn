package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

const analyticsErrCode = "analytics_failed"
const analyticsErrMessage = "falha ao apurar os totais"

// AnalyticsRepository implementa as consultas agregadas do dominio.
//
// Todas as somas acontecem no banco: trazer os lancamentos para a aplicacao
// so para soma-los seria caro e desnecessario.
type AnalyticsRepository struct {
	db *pgxpool.Pool
}

// NewAnalyticsRepository cria o repositorio.
func NewAnalyticsRepository(db *pgxpool.Pool) repository.TransactionAnalyticsRepository {
	return &AnalyticsRepository{db: db}
}

func (r *AnalyticsRepository) Totals(ctx context.Context, userID uuid.UUID, period vo.Period) (repository.Totals, error) {
	const query = `
		SELECT
			COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0),
			COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0),
			count(*)
		FROM transactions
		WHERE user_id = $1 AND occurred_on >= $2 AND occurred_on <= $3`

	var income, expense int64
	var count int

	err := r.db.QueryRow(ctx, query, userID, period.Start(), period.End()).Scan(&income, &expense, &count)
	if err != nil {
		return repository.Totals{}, translateError(err, analyticsErrCode, analyticsErrMessage)
	}

	return repository.Totals{
		Income:  vo.NewMoney(income),
		Expense: vo.NewMoney(expense),
		Count:   count,
	}, nil
}

func (r *AnalyticsRepository) TotalsByCategory(ctx context.Context, userID uuid.UUID, period vo.Period) ([]repository.CategoryTotal, error) {
	const query = `
		SELECT category_id, type, SUM(amount), count(*)
		FROM transactions
		WHERE user_id = $1 AND occurred_on >= $2 AND occurred_on <= $3
		GROUP BY category_id, type
		ORDER BY SUM(amount) DESC`

	rows, err := r.db.Query(ctx, query, userID, period.Start(), period.End())
	if err != nil {
		return nil, translateError(err, analyticsErrCode, analyticsErrMessage)
	}
	defer rows.Close()

	totals := make([]repository.CategoryTotal, 0)
	for rows.Next() {
		var (
			item    repository.CategoryTotal
			rawType string
			amount  int64
		)
		if err := rows.Scan(&item.CategoryID, &rawType, &amount, &item.Count); err != nil {
			return nil, translateError(err, analyticsErrCode, analyticsErrMessage)
		}

		item.Type = vo.TransactionType(rawType)
		item.Total = vo.NewMoney(amount)
		totals = append(totals, item)
	}
	return totals, translateError(rows.Err(), analyticsErrCode, analyticsErrMessage)
}

func (r *AnalyticsRepository) MonthlySeries(ctx context.Context, userID uuid.UUID, period vo.Period) ([]repository.MonthlyTotal, error) {
	const query = `
		SELECT
			date_trunc('month', occurred_on)::date AS month,
			COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0),
			COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0)
		FROM transactions
		WHERE user_id = $1 AND occurred_on >= $2 AND occurred_on <= $3
		GROUP BY month
		ORDER BY month`

	rows, err := r.db.Query(ctx, query, userID, period.Start(), period.End())
	if err != nil {
		return nil, translateError(err, analyticsErrCode, analyticsErrMessage)
	}
	defer rows.Close()

	series := make([]repository.MonthlyTotal, 0, 12)
	for rows.Next() {
		var (
			month           time.Time
			income, expense int64
		)
		if err := rows.Scan(&month, &income, &expense); err != nil {
			return nil, translateError(err, analyticsErrCode, analyticsErrMessage)
		}

		series = append(series, repository.MonthlyTotal{
			Month:   entity.NormalizeMonth(month),
			Income:  vo.NewMoney(income),
			Expense: vo.NewMoney(expense),
		})
	}
	return series, translateError(rows.Err(), analyticsErrCode, analyticsErrMessage)
}

func (r *AnalyticsRepository) DailySeries(ctx context.Context, userID uuid.UUID, period vo.Period) ([]repository.DailyTotal, error) {
	const query = `
		SELECT
			occurred_on,
			COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0),
			COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0)
		FROM transactions
		WHERE user_id = $1 AND occurred_on >= $2 AND occurred_on <= $3
		GROUP BY occurred_on
		ORDER BY occurred_on`

	rows, err := r.db.Query(ctx, query, userID, period.Start(), period.End())
	if err != nil {
		return nil, translateError(err, analyticsErrCode, analyticsErrMessage)
	}
	defer rows.Close()

	series := make([]repository.DailyTotal, 0, 31)
	for rows.Next() {
		var (
			day             time.Time
			income, expense int64
		)
		if err := rows.Scan(&day, &income, &expense); err != nil {
			return nil, translateError(err, analyticsErrCode, analyticsErrMessage)
		}

		series = append(series, repository.DailyTotal{
			Day:     vo.TruncateToDay(day),
			Income:  vo.NewMoney(income),
			Expense: vo.NewMoney(expense),
		})
	}
	return series, translateError(rows.Err(), analyticsErrCode, analyticsErrMessage)
}

func (r *AnalyticsRepository) NetUntil(ctx context.Context, userID uuid.UUID, until time.Time) (vo.Money, error) {
	const query = `
		SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
		FROM transactions
		WHERE user_id = $1 AND occurred_on <= $2`

	var net int64
	if err := r.db.QueryRow(ctx, query, userID, vo.TruncateToDay(until)).Scan(&net); err != nil {
		return vo.ZeroMoney, translateError(err, analyticsErrCode, analyticsErrMessage)
	}
	return vo.NewMoney(net), nil
}

func (r *AnalyticsRepository) NetByAccount(ctx context.Context, userID uuid.UUID) (map[uuid.UUID]vo.Money, error) {
	const query = `
		SELECT account_id, COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
		FROM transactions
		WHERE user_id = $1
		GROUP BY account_id`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, translateError(err, analyticsErrCode, analyticsErrMessage)
	}
	defer rows.Close()

	balances := make(map[uuid.UUID]vo.Money)
	for rows.Next() {
		var (
			accountID uuid.UUID
			net       int64
		)
		if err := rows.Scan(&accountID, &net); err != nil {
			return nil, translateError(err, analyticsErrCode, analyticsErrMessage)
		}
		balances[accountID] = vo.NewMoney(net)
	}
	return balances, translateError(rows.Err(), analyticsErrCode, analyticsErrMessage)
}

func (r *AnalyticsRepository) Extremes(
	ctx context.Context,
	userID uuid.UUID,
	period vo.Period,
	transactionType vo.TransactionType,
) (*entity.Transaction, *entity.Transaction, error) {
	highest, err := r.extreme(ctx, userID, period, transactionType, "DESC")
	if err != nil {
		return nil, nil, err
	}
	lowest, err := r.extreme(ctx, userID, period, transactionType, "ASC")
	if err != nil {
		return nil, nil, err
	}
	return highest, lowest, nil
}

// extreme devolve o lancamento de maior ou menor valor do periodo.
// A ausencia de lancamentos nao e erro: o insight simplesmente nao existe.
func (r *AnalyticsRepository) extreme(
	ctx context.Context,
	userID uuid.UUID,
	period vo.Period,
	transactionType vo.TransactionType,
	direction string,
) (*entity.Transaction, error) {
	query := `
		SELECT id, user_id, account_id, category_id, type, amount, description, notes, occurred_on, created_at, updated_at
		FROM transactions
		WHERE user_id = $1 AND type = $2 AND occurred_on >= $3 AND occurred_on <= $4
		ORDER BY amount ` + direction + `
		LIMIT 1`

	rows, err := r.db.Query(ctx, query, userID, transactionType.String(), period.Start(), period.End())
	if err != nil {
		return nil, translateError(err, analyticsErrCode, analyticsErrMessage)
	}
	defer rows.Close()

	if !rows.Next() {
		if err := rows.Err(); err != nil {
			return nil, translateError(err, analyticsErrCode, analyticsErrMessage)
		}
		return nil, nil
	}

	transaction, err := scanTransaction(rows)
	if err != nil {
		if domainerr.Is(err, domainerr.KindNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return transaction, nil
}
