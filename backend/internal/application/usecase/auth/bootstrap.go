package auth

import (
	"context"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// defaultCategory descreve uma categoria criada automaticamente no cadastro.
type defaultCategory struct {
	name  string
	kind  vo.TransactionType
	color string
	icon  string
}

// defaultCategories e o conjunto minimo para que o usuario consiga lancar uma
// transacao no primeiro minuto de uso, sem precisar configurar nada antes.
var defaultCategories = []defaultCategory{
	{"Salario", vo.TransactionTypeIncome, "#10B981", "wallet"},
	{"Freelance", vo.TransactionTypeIncome, "#22C55E", "briefcase"},
	{"Investimentos", vo.TransactionTypeIncome, "#14B8A6", "trending-up"},
	{"Moradia", vo.TransactionTypeExpense, "#7C3AED", "home"},
	{"Alimentacao", vo.TransactionTypeExpense, "#10B981", "utensils"},
	{"Transporte", vo.TransactionTypeExpense, "#F59E0B", "car"},
	{"Saude", vo.TransactionTypeExpense, "#EC4899", "heart-pulse"},
	{"Lazer", vo.TransactionTypeExpense, "#38BDF8", "party-popper"},
	{"Educacao", vo.TransactionTypeExpense, "#6366F1", "graduation-cap"},
	{"Outros", vo.TransactionTypeExpense, "#94A3B8", "ellipsis"},
}

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
	for _, seed := range defaultCategories {
		category, err := entity.NewCategory(userID, seed.name, seed.kind, seed.color, seed.icon)
		if err != nil {
			return err
		}
		if err := categories.Create(ctx, category); err != nil {
			return err
		}
	}

	account, err := entity.NewAccount(userID, "Conta Corrente", vo.AccountTypeChecking, vo.ZeroMoney, "#7C3AED", "landmark")
	if err != nil {
		return err
	}
	return accounts.Create(ctx, account)
}
