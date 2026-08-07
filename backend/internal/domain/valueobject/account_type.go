package valueobject

import (
	"strings"

	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
)

// AccountType identifica a natureza da conta financeira.
type AccountType string

const (
	AccountTypeChecking   AccountType = "checking"
	AccountTypeSavings    AccountType = "savings"
	AccountTypeCreditCard AccountType = "credit_card"
	AccountTypeCash       AccountType = "cash"
	AccountTypeInvestment AccountType = "investment"
)

var accountTypeAliases = map[string]AccountType{
	"checking":       AccountTypeChecking,
	"conta_corrente": AccountTypeChecking,
	"savings":        AccountTypeSavings,
	"poupanca":       AccountTypeSavings,
	"credit_card":    AccountTypeCreditCard,
	"cartao":         AccountTypeCreditCard,
	"cash":           AccountTypeCash,
	"dinheiro":       AccountTypeCash,
	"investment":     AccountTypeInvestment,
	"investimento":   AccountTypeInvestment,
}

// ParseAccountType valida e normaliza o tipo de conta.
func ParseAccountType(raw string) (AccountType, error) {
	if parsed, ok := accountTypeAliases[strings.ToLower(strings.TrimSpace(raw))]; ok {
		return parsed, nil
	}
	return "", domainerr.InvalidInput(
		"invalid_account_type",
		"tipo de conta deve ser 'checking', 'savings', 'credit_card', 'cash' ou 'investment'",
	)
}

func (a AccountType) String() string { return string(a) }

// IsValid reporta se o tipo esta entre os valores conhecidos.
func (a AccountType) IsValid() bool {
	switch a {
	case AccountTypeChecking, AccountTypeSavings, AccountTypeCreditCard, AccountTypeCash, AccountTypeInvestment:
		return true
	default:
		return false
	}
}
