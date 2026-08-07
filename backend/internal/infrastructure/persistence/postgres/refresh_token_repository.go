package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
)

const refreshTokenNotFoundCode = "refresh_token_not_found"
const refreshTokenNotFoundMessage = "sessao nao encontrada"

// RefreshTokenRepository persiste os refresh tokens no PostgreSQL.
type RefreshTokenRepository struct {
	db *pgxpool.Pool
}

// NewRefreshTokenRepository cria o repositorio.
func NewRefreshTokenRepository(db *pgxpool.Pool) repository.RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

func (r *RefreshTokenRepository) Create(ctx context.Context, token *entity.RefreshToken) error {
	const query = `
		INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5)`

	_, err := r.db.Exec(ctx, query, token.ID, token.UserID, token.TokenHash, token.ExpiresAt, token.CreatedAt)
	return translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
}

func (r *RefreshTokenRepository) FindByHash(ctx context.Context, tokenHash string) (*entity.RefreshToken, error) {
	const query = `
		SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
		FROM refresh_tokens WHERE token_hash = $1`

	var (
		token   entity.RefreshToken
		revoked *time.Time
	)

	err := r.db.QueryRow(ctx, query, tokenHash).Scan(
		&token.ID, &token.UserID, &token.TokenHash, &token.ExpiresAt, &revoked, &token.CreatedAt)
	if err != nil {
		return nil, translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
	}

	token.RevokedAt = revoked
	return &token, nil
}

func (r *RefreshTokenRepository) Revoke(ctx context.Context, token *entity.RefreshToken) error {
	const query = `UPDATE refresh_tokens SET revoked_at = $2 WHERE id = $1`

	_, err := r.db.Exec(ctx, query, token.ID, token.RevokedAt)
	return translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
}

func (r *RefreshTokenRepository) RevokeAllForUser(ctx context.Context, userID uuid.UUID) error {
	const query = `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`

	_, err := r.db.Exec(ctx, query, userID)
	return translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
}

// DeleteExpired limpa tokens vencidos, evitando que a tabela cresca sem limite.
func (r *RefreshTokenRepository) DeleteExpired(ctx context.Context) error {
	const query = `DELETE FROM refresh_tokens WHERE expires_at < now() - interval '30 days'`

	_, err := r.db.Exec(ctx, query)
	return translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
}
