package auth

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/service"
)

// bootstrapWorkspace cria as categorias e a conta padrao de um usuario recem
// registrado.
//
// Uma falha aqui nao invalida o cadastro: o usuario ja existe e consegue
// entrar, apenas comecaria com a lista vazia. Por isso o erro e devolvido
// para o chamador decidir — que apenas registra em log.
func bootstrapWorkspace(
	ctx context.Context,
	userID uuid.UUID,
	categories repository.CategoryRepository,
	accounts repository.AccountRepository,
) error {
	defaultCategories, defaultAccount, err := service.NewDefaultWorkspace(userID)
	if err != nil {
		return err
	}

	for _, category := range defaultCategories {
		if err := categories.Create(ctx, category); err != nil {
			return err
		}
	}

	return accounts.Create(ctx, defaultAccount)
}
