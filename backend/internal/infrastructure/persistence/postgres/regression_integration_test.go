package postgres

import (
	"context"
	"net/url"
	"os"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func regressionDB(t *testing.T) (*pgxpool.Pool, uuid.UUID) {
	t.Helper()
	connection := os.Getenv("TEST_DATABASE_URL")
	if connection == "" {
		t.Skip("defina TEST_DATABASE_URL para um PostgreSQL local descartável")
	}
	parsed, err := url.Parse(connection)
	require.NoError(t, err)
	require.Contains(t, []string{"localhost", "127.0.0.1"}, parsed.Hostname(), "testes limitados a banco local")
	require.NoError(t, Migrate(connection))
	pool, err := pgxpool.New(context.Background(), connection)
	require.NoError(t, err)
	id := uuid.New()
	_, err = pool.Exec(context.Background(), `INSERT INTO users(id,name,email,password_hash) VALUES($1,'Regressão',$2,'test-only')`, id, id.String()+"@example.invalid")
	require.NoError(t, err)
	t.Cleanup(func() { _, _ = pool.Exec(context.Background(), `DELETE FROM users WHERE id=$1`, id); pool.Close() })
	return pool, id
}

func TestPostgresAnalyticsExtremesComLiquidacao(t *testing.T) {
	pool, userID := regressionDB(t)
	ctx := context.Background()
	accountID, categoryID := uuid.New(), uuid.New()
	_, err := pool.Exec(ctx, `INSERT INTO accounts(id,user_id,name,type) VALUES($1,$2,'Test','checking')`, accountID, userID)
	require.NoError(t, err)
	_, err = pool.Exec(ctx, `INSERT INTO categories(id,user_id,name,type) VALUES($1,$2,'Test','expense')`, categoryID, userID)
	require.NoError(t, err)
	for _, amount := range []int{600, 8371, 4500} {
		_, err = pool.Exec(ctx, `INSERT INTO transactions(id,user_id,account_id,category_id,type,amount,description,occurred_on,is_settled,settled_at)
		VALUES($1,$2,$3,$4,'expense',$5,'Compra','2026-10-13',true,'2026-10-13')`, uuid.New(), userID, accountID, categoryID, amount)
		require.NoError(t, err)
	}
	analytics := NewAnalyticsRepository(pool)
	highest, lowest, err := analytics.Extremes(ctx, userID, vo.NewMonthPeriod(time.Date(2026, 10, 1, 0, 0, 0, 0, time.UTC)), vo.TransactionTypeExpense)
	require.NoError(t, err)
	require.NotNil(t, highest)
	require.NotNil(t, lowest)
	assert.Equal(t, int64(8371), highest.Amount.Cents())
	assert.Equal(t, int64(600), lowest.Amount.Cents())
	assert.True(t, highest.IsSettled)
	require.NotNil(t, highest.SettledAt)
	assert.Equal(t, "2026-10-13", highest.SettledAt.Format("2006-01-02"))
	_, _, err = analytics.Extremes(ctx, userID, vo.NewMonthPeriod(time.Date(2026, 9, 1, 0, 0, 0, 0, time.UTC)), vo.TransactionTypeExpense)
	require.NoError(t, err)
}

func TestPostgresRefreshRotationAcrossInstances(t *testing.T) {
	pool, userID := regressionDB(t)
	ctx := context.Background()
	repo := NewRefreshTokenRepository(pool)
	old, err := entity.NewRefreshToken(userID, uuid.NewString(), time.Now().Add(time.Hour))
	require.NoError(t, err)
	require.NoError(t, repo.Create(ctx, old))
	const requests = 16
	successorHash := uuid.NewString()
	results := make(chan *entity.RefreshToken, requests)
	errors := make(chan error, requests)
	var group sync.WaitGroup
	for i := 0; i < requests; i++ {
		group.Add(1)
		go func() {
			defer group.Done()
			next, err := entity.NewRefreshToken(userID, successorHash, time.Now().Add(time.Hour))
			if err == nil {
				next, err = NewRefreshTokenRepository(pool).Rotate(ctx, old.TokenHash, next, time.Now().UTC(), 30*time.Second)
			}
			results <- next
			errors <- err
		}()
	}
	group.Wait()
	close(errors)
	close(results)
	for err := range errors {
		require.NoError(t, err)
	}
	var successor *entity.RefreshToken
	for result := range results {
		if successor == nil {
			successor = result
		}
		assert.Equal(t, successor.ID, result.ID)
	}
	var count int
	require.NoError(t, pool.QueryRow(ctx, `SELECT count(*) FROM refresh_tokens WHERE user_id=$1`, userID).Scan(&count))
	assert.Equal(t, 2, count)
	_, err = pool.Exec(ctx, `UPDATE refresh_tokens SET revoked_at=now()-interval '1 minute' WHERE id=$1`, old.ID)
	require.NoError(t, err)
	_, err = repo.Rotate(ctx, old.TokenHash, successor, time.Now().UTC(), 30*time.Second)
	require.Error(t, err)
	assert.Equal(t, domainerr.KindUnauthorized, domainerr.KindOf(err))
	old.Revoke(time.Now().UTC())
	require.NoError(t, repo.Revoke(ctx, old))
	revoked, err := repo.FindByHash(ctx, successorHash)
	require.NoError(t, err)
	assert.False(t, revoked.IsUsable(time.Now().UTC()))
}
