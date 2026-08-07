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

// issueSession emite o par access/refresh token e persiste o refresh.
//
// Concentrar a emissao em um unico lugar garante que registro, login e
// refresh produzam exatamente a mesma forma de sessao.
func issueSession(
	ctx context.Context,
	user *entity.User,
	tokens TokenProvider,
	refreshTokens repository.RefreshTokenRepository,
) (*dto.AuthOutput, error) {
	accessToken, expiresIn, err := tokens.GenerateAccessToken(user.ID)
	if err != nil {
		return nil, domainerr.Internal("falha ao gerar o token de acesso", err)
	}

	refreshToken, refreshExpiresAt, err := tokens.GenerateRefreshToken()
	if err != nil {
		return nil, domainerr.Internal("falha ao gerar o token de renovacao", err)
	}

	stored, err := entity.NewRefreshToken(user.ID, tokens.HashRefreshToken(refreshToken), refreshExpiresAt)
	if err != nil {
		return nil, err
	}
	if err := refreshTokens.Create(ctx, stored); err != nil {
		return nil, err
	}

	return &dto.AuthOutput{
		AccessToken:           accessToken,
		RefreshToken:          refreshToken,
		ExpiresIn:             expiresIn,
		RefreshTokenExpiresIn: int(math.Max(0, time.Until(refreshExpiresAt).Seconds())),
		User:                  dto.ToUserOutput(user),
	}, nil
}
