// Package account reune os casos de uso de contas financeiras.
package account

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-financehub/backend/pkg/validator"
)

// CreateUseCase cria uma conta financeira.
type CreateUseCase struct {
	accounts repository.AccountRepository
}

// NewCreateUseCase monta o caso de uso.
func NewCreateUseCase(accounts repository.AccountRepository) *CreateUseCase {
	return &CreateUseCase{accounts: accounts}
}

// Execute valida e persiste a nova conta.
func (uc *CreateUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.CreateAccountInput) (*dto.AccountOutput, error) {
	v := validator.New()
	v.Required("name", input.Name, "nome")
	v.Required("type", input.Type, "tipo")
	if err := v.Error(); err != nil {
		return nil, err
	}

	accountType, err := vo.ParseAccountType(input.Type)
	if err != nil {
		return nil, err
	}

	initialBalance, err := vo.NewMoneyFromReais(input.InitialBalance)
	if err != nil {
		return nil, err
	}

	created, err := entity.NewAccount(userID, input.Name, accountType, initialBalance, input.Color, input.Icon)
	if err != nil {
		return nil, err
	}

	if err := uc.accounts.Create(ctx, created); err != nil {
		if domainerr.Is(err, domainerr.KindConflict) {
			return nil, domainerr.Conflict("account_already_exists", "ja existe uma conta com este nome")
		}
		return nil, err
	}

	// Conta recem-criada nao tem movimento: o saldo e o proprio saldo inicial.
	output := dto.ToAccountOutput(created, created.InitialBalance)
	return &output, nil
}
