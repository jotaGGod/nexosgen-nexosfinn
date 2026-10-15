package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
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
		SELECT id, user_id, token_hash, expires_at, revoked_at, created_at, replaced_by
		FROM refresh_tokens WHERE token_hash = $1`

	var (
		token   entity.RefreshToken
		revoked *time.Time
	)

	err := r.db.QueryRow(ctx, query, tokenHash).Scan(
		&token.ID, &token.UserID, &token.TokenHash, &token.ExpiresAt, &revoked, &token.CreatedAt, &token.ReplacedBy)
	if err != nil {
		return nil, translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
	}

	token.RevokedAt = revoked
	return &token, nil
}

// Rotate serializa renovações entre processos/instâncias com bloqueio da linha.
// A criação do sucessor e a revogação do anterior são uma única transação.
func (r *RefreshTokenRepository) Rotate(ctx context.Context, previousHash string, next *entity.RefreshToken, now time.Time, grace time.Duration) (*entity.RefreshToken, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
	}
	defer tx.Rollback(ctx)
	var previous entity.RefreshToken
	err = tx.QueryRow(ctx, `SELECT id, user_id, token_hash, expires_at, revoked_at, created_at, replaced_by
		FROM refresh_tokens WHERE token_hash = $1 FOR UPDATE`, previousHash).Scan(
		&previous.ID, &previous.UserID, &previous.TokenHash, &previous.ExpiresAt, &previous.RevokedAt, &previous.CreatedAt, &previous.ReplacedBy)
	if err != nil {
		return nil, translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
	}
	// O instante deve ser medido após adquirir o bloqueio: uma requisição que
	// começou antes pode ter esperado pela primeira rotação.
	now = time.Now().UTC()
	invalid := domainerr.Unauthorized("invalid_refresh_token", "sessao expirada, entre novamente")
	if !previous.ExpiresAt.After(now) || previous.UserID != next.UserID {
		return nil, invalid
	}
	if previous.RevokedAt != nil {
		if previous.ReplacedBy == nil || now.Before(*previous.RevokedAt) || now.Sub(*previous.RevokedAt) > grace {
			return nil, invalid
		}
		var successor entity.RefreshToken
		err = tx.QueryRow(ctx, `SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
			FROM refresh_tokens WHERE id = $1`, *previous.ReplacedBy).Scan(
			&successor.ID, &successor.UserID, &successor.TokenHash, &successor.ExpiresAt, &successor.RevokedAt, &successor.CreatedAt)
		if err != nil {
			return nil, translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
		}
		if !successor.IsUsable(now) || successor.TokenHash != next.TokenHash || successor.UserID != previous.UserID {
			return nil, invalid
		}
		return &successor, nil
	}
	_, err = tx.Exec(ctx, `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at) VALUES ($1,$2,$3,$4,$5)`, next.ID, next.UserID, next.TokenHash, next.ExpiresAt, next.CreatedAt)
	if err != nil {
		return nil, translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
	}
	_, err = tx.Exec(ctx, `UPDATE refresh_tokens SET revoked_at=$2, replaced_by=$3 WHERE id=$1`, previous.ID, now, next.ID)
	if err != nil {
		return nil, translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
	}
	if err = tx.Commit(ctx); err != nil {
		return nil, translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
	}
	return next, nil
}

func (r *RefreshTokenRepository) Revoke(ctx context.Context, token *entity.RefreshToken) error {
	const query = `WITH RECURSIVE chain AS (
		SELECT id, replaced_by FROM refresh_tokens WHERE id = $1
		UNION SELECT r.id, r.replaced_by FROM refresh_tokens r JOIN chain c ON r.id = c.replaced_by
	) UPDATE refresh_tokens SET revoked_at = $2, replaced_by = NULL WHERE id IN (SELECT id FROM chain)`

	_, err := r.db.Exec(ctx, query, token.ID, token.RevokedAt)
	return translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
}

func (r *RefreshTokenRepository) RevokeAllForUser(ctx context.Context, userID uuid.UUID) error {
	const query = `UPDATE refresh_tokens SET revoked_at = now(), replaced_by = NULL WHERE user_id = $1`

	_, err := r.db.Exec(ctx, query, userID)
	return translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
}

// DeleteExpired limpa tokens vencidos, evitando que a tabela cresca sem limite.
func (r *RefreshTokenRepository) DeleteExpired(ctx context.Context) error {
	const query = `DELETE FROM refresh_tokens WHERE expires_at < now() - interval '30 days'`

	_, err := r.db.Exec(ctx, query)
	return translateError(err, refreshTokenNotFoundCode, refreshTokenNotFoundMessage)
}
