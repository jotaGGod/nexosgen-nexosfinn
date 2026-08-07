// Package transaction reune os casos de uso de lancamentos financeiros.
package transaction

import (
	"context"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

// catalog guarda categorias e contas do usuario indexadas por id.
//
// Listar lancamentos exige resolver o nome e a cor de cada categoria e conta.
// Carregar os dois conjuntos de uma vez (sao dezenas de registros por usuario)
// e mais barato e mais simples do que um join por linha.
type catalog struct {
	categories map[uuid.UUID]*entity.Category
	accounts   map[uuid.UUID]*entity.Account
}

func loadCatalog(
	ctx context.Context,
	userID uuid.UUID,
	categories repository.CategoryRepository,
	accounts repository.AccountRepository,
) (*catalog, error) {
	categoryList, err := categories.ListByUser(ctx, userID, nil, true)
	if err != nil {
		return nil, err
	}
	accountList, err := accounts.ListByUser(ctx, userID, true)
	if err != nil {
		return nil, err
	}

	loaded := &catalog{
		categories: make(map[uuid.UUID]*entity.Category, len(categoryList)),
		accounts:   make(map[uuid.UUID]*entity.Account, len(accountList)),
	}
	for _, category := range categoryList {
		loaded.categories[category.ID] = category
	}
	for _, account := range accountList {
		loaded.accounts[account.ID] = account
	}
	return loaded, nil
}

// resolveReferences carrega e valida a categoria e a conta informadas,
// garantindo que ambas pertencam ao usuario e que a categoria seja compativel
// com o tipo do lancamento.
func resolveReferences(
	ctx context.Context,
	userID, categoryID, accountID uuid.UUID,
	transactionType vo.TransactionType,
	categories repository.CategoryRepository,
	accounts repository.AccountRepository,
) (*entity.Category, *entity.Account, error) {
	category, err := categories.FindByID(ctx, userID, categoryID)
	if err != nil {
		if domainerr.Is(err, domainerr.KindNotFound) {
			return nil, nil, domainerr.InvalidInput("category_not_found", "categoria nao encontrada")
		}
		return nil, nil, err
	}

	// Uma despesa lancada em categoria de receita distorceria todos os
	// relatorios, entao a incompatibilidade e barrada na entrada.
	if category.Type != transactionType {
		return nil, nil, domainerr.InvalidInput(
			"category_type_mismatch",
			"a categoria selecionada nao corresponde ao tipo do lancamento",
		)
	}

	account, err := accounts.FindByID(ctx, userID, accountID)
	if err != nil {
		if domainerr.Is(err, domainerr.KindNotFound) {
			return nil, nil, domainerr.InvalidInput("account_not_found", "conta nao encontrada")
		}
		return nil, nil, err
	}

	return category, account, nil
}
