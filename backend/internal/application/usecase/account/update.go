package account

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/service"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/pkg/validator"
)

// UpdateUseCase altera uma conta existente.
type UpdateUseCase struct {
	accounts  repository.AccountRepository
	analytics repository.TransactionAnalyticsRepository
}

// NewUpdateUseCase monta o caso de uso com suas dependencias.
func NewUpdateUseCase(
	accounts repository.AccountRepository,
	analytics repository.TransactionAnalyticsRepository,
) *UpdateUseCase {
	return &UpdateUseCase{accounts: accounts, analytics: analytics}
}

// Execute valida e aplica as alteracoes, devolvendo o saldo recalculado.
func (uc *UpdateUseCase) Execute(ctx context.Context, userID, accountID uuid.UUID, input dto.UpdateAccountInput) (*dto.AccountOutput, error) {
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

	existing, err := uc.accounts.FindByID(ctx, userID, accountID)
	if err != nil {
		return nil, err
	}

	if err := existing.Update(input.Name, accountType, initialBalance, input.Color, input.Icon); err != nil {
		return nil, err
	}
	if input.Archived {
		existing.Archive()
	} else {
		existing.Unarchive()
	}

	if err := uc.accounts.Update(ctx, existing); err != nil {
		if domainerr.Is(err, domainerr.KindConflict) {
			return nil, domainerr.Conflict("account_already_exists", "ja existe uma conta com este nome")
		}
		return nil, err
	}

	netByAccount, err := uc.analytics.NetByAccount(ctx, userID)
	if err != nil {
		return nil, err
	}

	output := dto.ToAccountOutput(existing, service.AccountBalance(existing, netByAccount[existing.ID]))
	return &output, nil
}
