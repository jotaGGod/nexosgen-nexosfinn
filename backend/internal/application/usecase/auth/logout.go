package auth

import (
	"context"
	"time"

	"github.com/jacks/finapp/backend/internal/application/dto"
	domainerr "github.com/jacks/finapp/backend/internal/domain/errors"
	"github.com/jacks/finapp/backend/internal/domain/repository"
)

// LogoutUseCase encerra a sessao revogando o refresh token apresentado.
type LogoutUseCase struct {
	refreshTokens repository.RefreshTokenRepository
	tokens        TokenProvider
}

// NewLogoutUseCase monta o caso de uso com suas dependencias.
func NewLogoutUseCase(refreshTokens repository.RefreshTokenRepository, tokens TokenProvider) *LogoutUseCase {
	return &LogoutUseCase{refreshTokens: refreshTokens, tokens: tokens}
}

// Execute revoga o refresh token.
//
// Um token desconhecido ou ja revogado nao e erro: o resultado pretendido
// pelo usuario — nao ter mais sessao — ja esta satisfeito.
func (uc *LogoutUseCase) Execute(ctx context.Context, input dto.RefreshInput) error {
	if input.RefreshToken == "" {
		return nil
	}

	stored, err := uc.refreshTokens.FindByHash(ctx, uc.tokens.HashRefreshToken(input.RefreshToken))
	if err != nil {
		if domainerr.Is(err, domainerr.KindNotFound) {
			return nil
		}
		return err
	}

	stored.Revoke(time.Now().UTC())
	return uc.refreshTokens.Revoke(ctx, stored)
}
