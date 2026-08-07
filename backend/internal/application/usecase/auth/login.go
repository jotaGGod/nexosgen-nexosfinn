package auth

import (
	"context"

	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/pkg/validator"
)

// LoginUseCase autentica um usuario por e-mail e senha.
type LoginUseCase struct {
	users         repository.UserRepository
	refreshTokens repository.RefreshTokenRepository
	hasher        PasswordHasher
	tokens        TokenProvider
}

// NewLoginUseCase monta o caso de uso com suas dependencias.
func NewLoginUseCase(
	users repository.UserRepository,
	refreshTokens repository.RefreshTokenRepository,
	hasher PasswordHasher,
	tokens TokenProvider,
) *LoginUseCase {
	return &LoginUseCase{users: users, refreshTokens: refreshTokens, hasher: hasher, tokens: tokens}
}

// Execute valida as credenciais e abre a sessao.
func (uc *LoginUseCase) Execute(ctx context.Context, input dto.LoginInput) (*dto.AuthOutput, error) {
	v := validator.New()
	v.Required("email", input.Email, "e-mail")
	v.Required("password", input.Password, "senha")
	if err := v.Error(); err != nil {
		return nil, err
	}

	// Credencial invalida devolve sempre a mesma resposta, com ou sem usuario
	// correspondente, para nao revelar quais e-mails existem na base.
	invalidCredentials := domainerr.Unauthorized("invalid_credentials", "e-mail ou senha incorretos")

	email, err := vo.NewEmail(input.Email)
	if err != nil {
		return nil, invalidCredentials
	}

	user, err := uc.users.FindByEmail(ctx, email)
	if err != nil {
		if domainerr.Is(err, domainerr.KindNotFound) {
			return nil, invalidCredentials
		}
		return nil, err
	}

	if !uc.hasher.Compare(user.PasswordHash, input.Password) {
		return nil, invalidCredentials
	}

	return issueSession(ctx, user, uc.tokens, uc.refreshTokens)
}
