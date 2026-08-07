package auth

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/pkg/validator"
)

// GetProfileUseCase devolve os dados do usuario autenticado.
type GetProfileUseCase struct {
	users repository.UserRepository
}

// NewGetProfileUseCase monta o caso de uso.
func NewGetProfileUseCase(users repository.UserRepository) *GetProfileUseCase {
	return &GetProfileUseCase{users: users}
}

// Execute carrega o perfil.
func (uc *GetProfileUseCase) Execute(ctx context.Context, userID uuid.UUID) (*dto.UserOutput, error) {
	user, err := uc.users.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	output := dto.ToUserOutput(user)
	return &output, nil
}

// UpdateProfileUseCase altera nome e e-mail do usuario.
type UpdateProfileUseCase struct {
	users repository.UserRepository
}

// NewUpdateProfileUseCase monta o caso de uso.
func NewUpdateProfileUseCase(users repository.UserRepository) *UpdateProfileUseCase {
	return &UpdateProfileUseCase{users: users}
}

// Execute valida e aplica as alteracoes cadastrais.
func (uc *UpdateProfileUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.UpdateProfileInput) (*dto.UserOutput, error) {
	v := validator.New()
	v.Required("name", input.Name, "nome")
	v.Required("email", input.Email, "e-mail")
	if err := v.Error(); err != nil {
		return nil, err
	}

	user, err := uc.users.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	email, err := vo.NewEmail(input.Email)
	if err != nil {
		return nil, err
	}

	if email.String() != user.Email.String() {
		exists, err := uc.users.ExistsByEmail(ctx, email)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, domainerr.Conflict("email_already_used", "ja existe uma conta com este e-mail")
		}
	}

	if err := user.Rename(input.Name); err != nil {
		return nil, err
	}
	if err := user.ChangeEmail(input.Email); err != nil {
		return nil, err
	}

	if err := uc.users.Update(ctx, user); err != nil {
		return nil, err
	}

	output := dto.ToUserOutput(user)
	return &output, nil
}

// ChangePasswordUseCase troca a senha do usuario autenticado.
type ChangePasswordUseCase struct {
	users         repository.UserRepository
	refreshTokens repository.RefreshTokenRepository
	hasher        PasswordHasher
}

// NewChangePasswordUseCase monta o caso de uso.
func NewChangePasswordUseCase(
	users repository.UserRepository,
	refreshTokens repository.RefreshTokenRepository,
	hasher PasswordHasher,
) *ChangePasswordUseCase {
	return &ChangePasswordUseCase{users: users, refreshTokens: refreshTokens, hasher: hasher}
}

// Execute valida a senha atual, grava a nova e derruba as demais sessoes.
func (uc *ChangePasswordUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.ChangePasswordInput) error {
	v := validator.New()
	v.Required("current_password", input.CurrentPassword, "senha atual")
	v.Required("new_password", input.NewPassword, "nova senha").
		MinLength("new_password", input.NewPassword, "nova senha", minPasswordLength)
	if err := v.Error(); err != nil {
		return err
	}

	user, err := uc.users.FindByID(ctx, userID)
	if err != nil {
		return err
	}

	if !uc.hasher.Compare(user.PasswordHash, input.CurrentPassword) {
		return domainerr.Unauthorized("invalid_current_password", "senha atual incorreta")
	}

	hash, err := uc.hasher.Hash(input.NewPassword)
	if err != nil {
		return domainerr.Internal("falha ao processar a senha", err)
	}

	if err := user.ChangePasswordHash(hash); err != nil {
		return err
	}
	if err := uc.users.Update(ctx, user); err != nil {
		return err
	}

	// Trocar a senha encerra as sessoes abertas: se ela foi trocada por
	// suspeita de acesso indevido, o invasor perde o refresh token.
	return uc.refreshTokens.RevokeAllForUser(ctx, userID)
}
