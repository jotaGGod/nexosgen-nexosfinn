package entity

import (
	"time"

	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
)

// RefreshToken permite renovar o access token sem novo login.
//
// Apenas o hash e persistido; o token em si vive somente no cookie httpOnly
// do cliente.
type RefreshToken struct {
	ID         uuid.UUID
	UserID     uuid.UUID
	TokenHash  string
	ExpiresAt  time.Time
	RevokedAt  *time.Time
	ReplacedBy *uuid.UUID
	CreatedAt  time.Time
}

// NewRefreshToken cria um refresh token validado.
func NewRefreshToken(userID uuid.UUID, tokenHash string, expiresAt time.Time) (*RefreshToken, error) {
	if tokenHash == "" {
		return nil, domainerr.Internal("refresh token gerado de forma incompleta", nil)
	}
	if !expiresAt.After(time.Now().UTC()) {
		return nil, domainerr.Internal("refresh token gerado ja expirado", nil)
	}

	return &RefreshToken{
		ID:        uuid.New(),
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: expiresAt.UTC(),
		CreatedAt: time.Now().UTC(),
	}, nil
}

// IsUsable reporta se o token ainda pode gerar um novo access token.
func (t *RefreshToken) IsUsable(now time.Time) bool {
	return t.RevokedAt == nil && t.ExpiresAt.After(now)
}

// Revoke invalida o token, encerrando a sessao correspondente.
func (t *RefreshToken) Revoke(now time.Time) {
	if t.RevokedAt != nil {
		return
	}
	revokedAt := now.UTC()
	t.RevokedAt = &revokedAt
}
