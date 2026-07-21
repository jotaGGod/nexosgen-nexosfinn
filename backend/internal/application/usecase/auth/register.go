package auth

import (
	"context"
	"log/slog"

	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	domainerr "github.com/jacks/finapp/backend/internal/domain/errors"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
	"github.com/jacks/finapp/backend/pkg/validator"
)

// minPasswordLength e o tamanho minimo aceito para a senha.
const minPasswordLength = 8

// RegisterUseCase cria uma conta e ja devolve a sessao autenticada, evitando
// que o usuario precise fazer login logo apos o cadastro.
type RegisterUseCase struct {
	users         repository.UserRepository
	categories    repository.CategoryRepository
	accounts      repository.AccountRepository
	refreshTokens repository.RefreshTokenRepository
	hasher        PasswordHasher
	tokens        TokenProvider
	logger        *slog.Logger
}

// NewRegisterUseCase monta o caso de uso com suas dependencias.
func NewRegisterUseCase(
	users repository.UserRepository,
	categories repository.CategoryRepository,
	accounts repository.AccountRepository,
	refreshTokens repository.RefreshTokenRepository,
	hasher PasswordHasher,
	tokens TokenProvider,
	logger *slog.Logger,
) *RegisterUseCase {
	return &RegisterUseCase{
		users:         users,
		categories:    categories,
		accounts:      accounts,
		refreshTokens: refreshTokens,
		hasher:        hasher,
		tokens:        tokens,
		logger:        logger,
	}
}

// Execute registra o usuario, semeia seu espaco de trabalho e abre a sessao.
func (uc *RegisterUseCase) Execute(ctx context.Context, input dto.RegisterInput) (*dto.AuthOutput, error) {
	v := validator.New()
	v.Required("name", input.Name, "nome").MaxLength("name", input.Name, "nome", 120)
	v.Required("email", input.Email, "e-mail")
	v.Required("password", input.Password, "senha").MinLength("password", input.Password, "senha", minPasswordLength)
	if err := v.Error(); err != nil {
		return nil, err
	}

	email, err := vo.NewEmail(input.Email)
	if err != nil {
		return nil, err
	}

	exists, err := uc.users.ExistsByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, domainerr.Conflict("email_already_used", "ja existe uma conta com este e-mail")
	}

	passwordHash, err := uc.hasher.Hash(input.Password)
	if err != nil {
		return nil, domainerr.Internal("falha ao processar a senha", err)
	}

	user, err := entity.NewUser(input.Name, input.Email, passwordHash)
	if err != nil {
		return nil, err
	}

	if err := uc.users.Create(ctx, user); err != nil {
		return nil, err
	}

	// O espaco de trabalho inicial e uma conveniencia, nao um requisito do
	// cadastro: se falhar, o usuario segue autenticado com a lista vazia.
	if err := bootstrapWorkspace(ctx, user.ID, uc.categories, uc.accounts); err != nil {
		uc.logger.ErrorContext(ctx, "falha ao criar dados iniciais do usuario",
			slog.String("user_id", user.ID.String()), slog.Any("error", err))
	}

	return issueSession(ctx, user, uc.tokens, uc.refreshTokens)
}
