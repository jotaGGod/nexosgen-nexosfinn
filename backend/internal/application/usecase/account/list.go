package account

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/service"
)

// ListUseCase devolve as contas do usuario com o saldo de cada uma.
type ListUseCase struct {
	accounts  repository.AccountRepository
	analytics repository.TransactionAnalyticsRepository
}

// NewListUseCase monta o caso de uso com suas dependencias.
func NewListUseCase(
	accounts repository.AccountRepository,
	analytics repository.TransactionAnalyticsRepository,
) *ListUseCase {
	return &ListUseCase{accounts: accounts, analytics: analytics}
}

// Execute lista as contas e deriva o saldo de cada uma em uma unica consulta
// agregada, em vez de uma consulta por conta.
func (uc *ListUseCase) Execute(ctx context.Context, userID uuid.UUID, includeArchived bool) ([]dto.AccountOutput, error) {
	found, err := uc.accounts.ListByUser(ctx, userID, includeArchived)
	if err != nil {
		return nil, err
	}

	netByAccount, err := uc.analytics.NetByAccount(ctx, userID)
	if err != nil {
		return nil, err
	}

	items := make([]dto.AccountOutput, 0, len(found))
	for _, item := range found {
		items = append(items, dto.ToAccountOutput(item, service.AccountBalance(item, netByAccount[item.ID])))
	}
	return items, nil
}
