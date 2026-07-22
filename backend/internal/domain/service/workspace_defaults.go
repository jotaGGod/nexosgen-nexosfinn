package service

import (
	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// defaultCategory descreve uma categoria criada automaticamente no espaco de trabalho inicial.
type defaultCategory struct {
	name  string
	kind  vo.TransactionType
	color string
	icon  string
}

// defaultCategories permite que o primeiro lancamento seja feito sem configuracao previa.
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

// NewDefaultWorkspace monta os dados iniciais usados tanto no cadastro quanto
// ao recomecar. As entidades recebem IDs novos a cada chamada.
func NewDefaultWorkspace(userID uuid.UUID) ([]*entity.Category, *entity.Account, error) {
	categories := make([]*entity.Category, 0, len(defaultCategories))
	for _, seed := range defaultCategories {
		category, err := entity.NewCategory(userID, seed.name, seed.kind, seed.color, seed.icon)
		if err != nil {
			return nil, nil, err
		}
		categories = append(categories, category)
	}

	account, err := entity.NewAccount(
		userID,
		"Conta Corrente",
		vo.AccountTypeChecking,
		vo.ZeroMoney,
		"#7C3AED",
		"landmark",
	)
	if err != nil {
		return nil, nil, err
	}

	return categories, account, nil
}
