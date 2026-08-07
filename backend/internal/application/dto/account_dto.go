package dto

import (
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

// CreateAccountInput e o payload de criacao de conta financeira.
type CreateAccountInput struct {
	Name           string  `json:"name"`
	Type           string  `json:"type"`
	InitialBalance float64 `json:"initial_balance"`
	Color          string  `json:"color"`
	Icon           string  `json:"icon"`
}

// UpdateAccountInput e o payload de atualizacao de conta financeira.
type UpdateAccountInput struct {
	Name           string  `json:"name"`
	Type           string  `json:"type"`
	InitialBalance float64 `json:"initial_balance"`
	Color          string  `json:"color"`
	Icon           string  `json:"icon"`
	Archived       bool    `json:"archived"`
}

// AccountRefOutput e a referencia enxuta usada dentro de outros recursos.
type AccountRefOutput struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
	Icon string `json:"icon"`
}

// AccountOutput e a projecao completa da conta, com o saldo derivado.
type AccountOutput struct {
	ID             string      `json:"id"`
	Name           string      `json:"name"`
	Type           string      `json:"type"`
	InitialBalance MoneyOutput `json:"initial_balance"`
	Balance        MoneyOutput `json:"balance"`
	Color          string      `json:"color"`
	Icon           string      `json:"icon"`
	Archived       bool        `json:"archived"`
}

// ToAccountRefOutput serializa a referencia da conta.
func ToAccountRefOutput(account *entity.Account) AccountRefOutput {
	if account == nil {
		return AccountRefOutput{}
	}
	return AccountRefOutput{
		ID:   account.ID.String(),
		Name: account.Name,
		Type: account.Type.String(),
		Icon: account.Icon,
	}
}

// ToAccountOutput serializa a conta com o saldo ja calculado.
func ToAccountOutput(account *entity.Account, balance vo.Money) AccountOutput {
	return AccountOutput{
		ID:             account.ID.String(),
		Name:           account.Name,
		Type:           account.Type.String(),
		InitialBalance: ToMoneyOutput(account.InitialBalance),
		Balance:        ToMoneyOutput(balance),
		Color:          account.Color,
		Icon:           account.Icon,
		Archived:       account.Archived,
	}
}
