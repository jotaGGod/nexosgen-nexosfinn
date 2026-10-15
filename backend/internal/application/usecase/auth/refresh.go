package auth

import (
	"context"
	"math"
	"time"

	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
)

// RefreshUseCase troca um refresh token valido por uma nova sessao.
//
// A rotação é atômica. Chamadas concorrentes recebem o mesmo sucessor durante
// 30 segundos; depois disso o token anterior é definitivamente rejeitado.
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

	now := time.Now().UTC()
	if !stored.ExpiresAt.After(now) {
		return nil, invalidToken
	}

	user, err := uc.users.FindByID(ctx, stored.UserID)
	if err != nil {
		if domainerr.Is(err, domainerr.KindNotFound) {
			return nil, invalidToken
		}
		return nil, err
	}

	accessToken, expiresIn, err := uc.tokens.GenerateAccessToken(user.ID)
	if err != nil {
		return nil, domainerr.Internal("falha ao gerar o token de acesso", err)
	}
	_, expiresAt, err := uc.tokens.GenerateRefreshToken()
	if err != nil {
		return nil, domainerr.Internal("falha ao gerar o token de renovacao", err)
	}
	refreshToken := uc.tokens.SuccessorRefreshToken(input.RefreshToken)
	next, err := entity.NewRefreshToken(user.ID, uc.tokens.HashRefreshToken(refreshToken), expiresAt)
	if err != nil {
		return nil, err
	}
	rotated, err := uc.refreshTokens.Rotate(ctx, stored.TokenHash, next, now, 30*time.Second)
	if err != nil {
		return nil, err
	}
	return &dto.AuthOutput{
		AccessToken: accessToken, RefreshToken: refreshToken, ExpiresIn: expiresIn,
		RefreshTokenExpiresIn: int(math.Max(0, time.Until(rotated.ExpiresAt).Seconds())),
		User:                  dto.ToUserOutput(user),
	}, nil
}
