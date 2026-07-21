package entity

import (
	"time"

	"github.com/google/uuid"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// Account e uma conta financeira do usuario (corrente, poupanca, cartao de
// credito, dinheiro ou investimento).
//
// O saldo corrente nao e um campo: ele e sempre derivado de InitialBalance
// somado as transacoes da conta, evitando divergencia entre o extrato e o saldo.
type Account struct {
	ID             uuid.UUID
	UserID         uuid.UUID
	Name           string
	Type           vo.AccountType
	InitialBalance vo.Money
	Color          string
	Icon           string
	Archived       bool
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

// NewAccount cria uma conta validada para o usuario informado.
func NewAccount(userID uuid.UUID, name string, accountType vo.AccountType, initialBalance vo.Money, color, icon string) (*Account, error) {
	normalizedName, err := normalizeName(name, "name", "nome da conta")
	if err != nil {
		return nil, err
	}

	if !accountType.IsValid() {
		if _, parseErr := vo.ParseAccountType(accountType.String()); parseErr != nil {
			return nil, parseErr
		}
	}

	normalizedColor, err := normalizeColor(color)
	if err != nil {
		return nil, err
	}

	normalizedIcon, err := normalizeIcon(icon, "wallet")
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	return &Account{
		ID:             uuid.New(),
		UserID:         userID,
		Name:           normalizedName,
		Type:           accountType,
		InitialBalance: initialBalance,
		Color:          normalizedColor,
		Icon:           normalizedIcon,
		CreatedAt:      now,
		UpdatedAt:      now,
	}, nil
}

// Update aplica alteracoes validadas na conta.
func (a *Account) Update(name string, accountType vo.AccountType, initialBalance vo.Money, color, icon string) error {
	normalizedName, err := normalizeName(name, "name", "nome da conta")
	if err != nil {
		return err
	}

	if !accountType.IsValid() {
		if _, parseErr := vo.ParseAccountType(accountType.String()); parseErr != nil {
			return parseErr
		}
	}

	normalizedColor, err := normalizeColor(color)
	if err != nil {
		return err
	}

	normalizedIcon, err := normalizeIcon(icon, "wallet")
	if err != nil {
		return err
	}

	a.Name = normalizedName
	a.Type = accountType
	a.InitialBalance = initialBalance
	a.Color = normalizedColor
	a.Icon = normalizedIcon
	a.UpdatedAt = time.Now().UTC()
	return nil
}

// Archive esconde a conta das listagens sem apagar o historico.
func (a *Account) Archive() {
	a.Archived = true
	a.UpdatedAt = time.Now().UTC()
}

// Unarchive devolve a conta as listagens.
func (a *Account) Unarchive() {
	a.Archived = false
	a.UpdatedAt = time.Now().UTC()
}
