// Package repository declara os contratos de persistencia do dominio.
//
// As interfaces vivem aqui, junto de quem as consome, e sao implementadas em
// internal/infrastructure/persistence. E essa inversao (DIP) que mantem o
// dominio ignorante quanto a Postgres, pgx ou qualquer outro detalhe.
package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// UserRepository persiste titulares de conta.
type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	Update(ctx context.Context, user *entity.User) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error)
	FindByEmail(ctx context.Context, email vo.Email) (*entity.User, error)
	ExistsByEmail(ctx context.Context, email vo.Email) (bool, error)
}
