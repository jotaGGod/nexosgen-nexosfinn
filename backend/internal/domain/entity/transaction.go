package entity

import (
	"strings"
	"time"

	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/errors"
	vo "github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/valueobject"
)

const maxDescriptionLength = 200
const maxNotesLength = 1000

// Transaction e um lancamento financeiro. O valor e sempre armazenado
// positivo; o sinal contabil vem do Type.
type Transaction struct {
	ID          uuid.UUID
	UserID      uuid.UUID
	AccountID   uuid.UUID
	CategoryID  uuid.UUID
	Type        vo.TransactionType
	Amount      vo.Money
	Description string
	Notes       string
	OccurredOn  time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// NewTransaction cria um lancamento validado.
func NewTransaction(
	userID, accountID, categoryID uuid.UUID,
	transactionType vo.TransactionType,
	amount vo.Money,
	description, notes string,
	occurredOn time.Time,
) (*Transaction, error) {
	transaction := &Transaction{
		ID:         uuid.New(),
		UserID:     userID,
		AccountID:  accountID,
		CategoryID: categoryID,
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	}

	if err := transaction.apply(accountID, categoryID, transactionType, amount, description, notes, occurredOn); err != nil {
		return nil, err
	}
	return transaction, nil
}

// Update aplica alteracoes validadas no lancamento.
func (t *Transaction) Update(
	accountID, categoryID uuid.UUID,
	transactionType vo.TransactionType,
	amount vo.Money,
	description, notes string,
	occurredOn time.Time,
) error {
	if err := t.apply(accountID, categoryID, transactionType, amount, description, notes, occurredOn); err != nil {
		return err
	}
	t.UpdatedAt = time.Now().UTC()
	return nil
}

func (t *Transaction) apply(
	accountID, categoryID uuid.UUID,
	transactionType vo.TransactionType,
	amount vo.Money,
	description, notes string,
	occurredOn time.Time,
) error {
	if accountID == uuid.Nil {
		return domainerr.InvalidInput("account_required", "conta e obrigatoria")
	}
	if categoryID == uuid.Nil {
		return domainerr.InvalidInput("category_required", "categoria e obrigatoria")
	}

	if !transactionType.IsValid() {
		if _, err := vo.ParseTransactionType(transactionType.String()); err != nil {
			return err
		}
	}

	if !amount.IsPositive() {
		return domainerr.InvalidInput("invalid_amount", "valor deve ser maior que zero")
	}

	trimmedDescription := strings.TrimSpace(description)
	if trimmedDescription == "" {
		return domainerr.InvalidInput("description_required", "descricao e obrigatoria")
	}
	if len(trimmedDescription) > maxDescriptionLength {
		return domainerr.InvalidInput("description_too_long", "descricao excede o tamanho maximo")
	}

	trimmedNotes := strings.TrimSpace(notes)
	if len(trimmedNotes) > maxNotesLength {
		return domainerr.InvalidInput("notes_too_long", "observacoes excedem o tamanho maximo")
	}

	if occurredOn.IsZero() {
		return domainerr.InvalidInput("date_required", "data e obrigatoria")
	}

	t.AccountID = accountID
	t.CategoryID = categoryID
	t.Type = transactionType
	t.Amount = amount
	t.Description = trimmedDescription
	t.Notes = trimmedNotes
	t.OccurredOn = vo.TruncateToDay(occurredOn)
	return nil
}

// SignedAmount devolve o valor com sinal contabil: positivo para receita,
// negativo para despesa.
func (t *Transaction) SignedAmount() vo.Money { return t.Type.Signed(t.Amount) }
