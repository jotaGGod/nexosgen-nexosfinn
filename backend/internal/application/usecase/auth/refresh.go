package auth

import (
	"context"
	"time"

	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
)

// RefreshUseCase troca um refresh token valido por uma nova sessao.
//
// A rotacao e obrigatoria: o token apresentado e revogado no mesmo ato em que
// o novo e emitido, de modo que um token vazado so serve uma vez.
type RefreshUseCase struct {
	users         repository.UserRepository
	refreshTokens repository.RefreshTokenRepository
	tokens        TokenProvider
}

// NewRefreshUseCase monta o caso de uso com suas dependencias.
func NewRefreshUseCase(
	users repository.UserRepository,
	refreshTokens repository.RefreshTokenRepository,
	tokens TokenProvider,
) *RefreshUseCase {
	return &RefreshUseCase{users: users, refreshTokens: refreshTokens, tokens: tokens}
}

// Execute valida o refresh token, revoga-o e emite uma nova sessao.
func (uc *RefreshUseCase) Execute(ctx context.Context, input dto.RefreshInput) (*dto.AuthOutput, error) {
	if input.RefreshToken == "" {
		return nil, domainerr.Unauthorized("refresh_token_required", "sessao expirada, entre novamente")
	}

	invalidToken := domainerr.Unauthorized("invalid_refresh_token", "sessao expirada, entre novamente")

	stored, err := uc.refreshTokens.FindByHash(ctx, uc.tokens.HashRefreshToken(input.RefreshToken))
	if err != nil {
		if domainerr.Is(err, domainerr.KindNotFound) {
			return nil, invalidToken
		}
		return nil, err
	}

	if !stored.IsUsable(time.Now().UTC()) {
		return nil, invalidToken
	}

	user, err := uc.users.FindByID(ctx, stored.UserID)
	if err != nil {
		if domainerr.Is(err, domainerr.KindNotFound) {
			return nil, invalidToken
		}
		return nil, err
	}

	stored.Revoke(time.Now().UTC())
	if err := uc.refreshTokens.Revoke(ctx, stored); err != nil {
		return nil, err
	}

	return issueSession(ctx, user, uc.tokens, uc.refreshTokens)
}
