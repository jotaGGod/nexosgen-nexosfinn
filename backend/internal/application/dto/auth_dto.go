package dto

import (
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
)

// RegisterInput e o payload de criacao de conta.
type RegisterInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginInput e o payload de autenticacao.
type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RefreshInput carrega o refresh token apresentado pelo cliente.
type RefreshInput struct {
	RefreshToken string `json:"refresh_token"`
}

// UserOutput e a projecao publica do usuario. Nunca inclui o hash da senha.
type UserOutput struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	CreatedAt string `json:"created_at"`
}

// ToUserOutput serializa um usuario.
func ToUserOutput(user *entity.User) UserOutput {
	return UserOutput{
		ID:        user.ID.String(),
		Name:      user.Name,
		Email:     user.Email.String(),
		CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// AuthOutput e o resultado de um login, registro ou refresh bem-sucedido.
type AuthOutput struct {
	AccessToken           string     `json:"access_token"`
	RefreshToken          string     `json:"refresh_token"`
	ExpiresIn             int        `json:"expires_in"`
	RefreshTokenExpiresIn int        `json:"refresh_token_expires_in"`
	User                  UserOutput `json:"user"`
}

// UpdateProfileInput altera os dados cadastrais do usuario.
type UpdateProfileInput struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

// ChangePasswordInput troca a senha exigindo a senha atual.
type ChangePasswordInput struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}
