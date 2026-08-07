package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
)

// RefreshTokenRepository persiste os refresh tokens das sessoes web.
type RefreshTokenRepository interface {
	Create(ctx context.Context, token *entity.RefreshToken) error
	FindByHash(ctx context.Context, tokenHash string) (*entity.RefreshToken, error)
	Revoke(ctx context.Context, token *entity.RefreshToken) error
	RevokeAllForUser(ctx context.Context, userID uuid.UUID) error
	DeleteExpired(ctx context.Context) error
}
