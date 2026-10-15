package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
)

// RefreshTokenRepository persiste os refresh tokens das sessoes web.
type RefreshTokenRepository interface {
	Create(ctx context.Context, token *entity.RefreshToken) error
	FindByHash(ctx context.Context, tokenHash string) (*entity.RefreshToken, error)
	// Rotate atomically replaces a token, or returns its existing successor
	// during the bounded concurrency window. Explicit revocation never qualifies.
	Rotate(ctx context.Context, previousHash string, next *entity.RefreshToken, now time.Time, grace time.Duration) (*entity.RefreshToken, error)
	Revoke(ctx context.Context, token *entity.RefreshToken) error
	RevokeAllForUser(ctx context.Context, userID uuid.UUID) error
	DeleteExpired(ctx context.Context) error
}
