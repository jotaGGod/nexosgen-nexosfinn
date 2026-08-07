package entity

import (
	"time"

	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

// User e o titular da conta no nexosgen-financehub e a raiz de agregacao de todos os
// demais recursos (contas, categorias, transacoes, metas, orcamentos e chaves).
type User struct {
	ID           uuid.UUID
	Name         string
	Email        vo.Email
	PasswordHash string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// NewUser cria um usuario ja validado. O hash da senha e produzido na
// infraestrutura: o dominio nunca ve a senha em texto puro.
func NewUser(name, email, passwordHash string) (*User, error) {
	normalizedName, err := normalizeName(name, "name", "nome")
	if err != nil {
		return nil, err
	}

	parsedEmail, err := vo.NewEmail(email)
	if err != nil {
		return nil, err
	}

	if passwordHash == "" {
		return nil, domainerr.InvalidInput("password_required", "senha e obrigatoria")
	}

	now := time.Now().UTC()
	return &User{
		ID:           uuid.New(),
		Name:         normalizedName,
		Email:        parsedEmail,
		PasswordHash: passwordHash,
		CreatedAt:    now,
		UpdatedAt:    now,
	}, nil
}

// Rename altera o nome de exibicao do usuario.
func (u *User) Rename(name string) error {
	normalizedName, err := normalizeName(name, "name", "nome")
	if err != nil {
		return err
	}
	u.Name = normalizedName
	u.UpdatedAt = time.Now().UTC()
	return nil
}

// ChangeEmail troca o e-mail de acesso.
func (u *User) ChangeEmail(email string) error {
	parsedEmail, err := vo.NewEmail(email)
	if err != nil {
		return err
	}
	u.Email = parsedEmail
	u.UpdatedAt = time.Now().UTC()
	return nil
}

// ChangePasswordHash substitui o hash da senha.
func (u *User) ChangePasswordHash(hash string) error {
	if hash == "" {
		return domainerr.InvalidInput("password_required", "senha e obrigatoria")
	}
	u.PasswordHash = hash
	u.UpdatedAt = time.Now().UTC()
	return nil
}
