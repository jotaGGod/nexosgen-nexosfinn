package entity

import (
	"time"

	"github.com/google/uuid"
	domainerr "github.com/jacks/finapp/backend/internal/domain/errors"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// Budget e o limite de gasto definido para uma categoria em um mes.
//
// Month e sempre normalizado para o primeiro dia do mes, o que permite o
// indice unico (user_id, category_id, month) no banco.
type Budget struct {
	ID          uuid.UUID
	UserID      uuid.UUID
	CategoryID  uuid.UUID
	Month       time.Time
	LimitAmount vo.Money
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// NormalizeMonth reduz uma data ao primeiro dia do seu mes, em UTC.
func NormalizeMonth(reference time.Time) time.Time {
	utc := reference.UTC()
	return time.Date(utc.Year(), utc.Month(), 1, 0, 0, 0, 0, time.UTC)
}

// NewBudget cria um orcamento validado.
func NewBudget(userID, categoryID uuid.UUID, month time.Time, limitAmount vo.Money) (*Budget, error) {
	if categoryID == uuid.Nil {
		return nil, domainerr.InvalidInput("category_required", "categoria e obrigatoria")
	}
	if month.IsZero() {
		return nil, domainerr.InvalidInput("month_required", "mes de referencia e obrigatorio")
	}
	if !limitAmount.IsPositive() {
		return nil, domainerr.InvalidInput("invalid_limit_amount", "limite deve ser maior que zero")
	}

	now := time.Now().UTC()
	return &Budget{
		ID:          uuid.New(),
		UserID:      userID,
		CategoryID:  categoryID,
		Month:       NormalizeMonth(month),
		LimitAmount: limitAmount,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

// ChangeLimit altera o limite mensal do orcamento.
func (b *Budget) ChangeLimit(limitAmount vo.Money) error {
	if !limitAmount.IsPositive() {
		return domainerr.InvalidInput("invalid_limit_amount", "limite deve ser maior que zero")
	}
	b.LimitAmount = limitAmount
	b.UpdatedAt = time.Now().UTC()
	return nil
}

// Period devolve o intervalo de datas coberto pelo orcamento.
func (b *Budget) Period() vo.Period { return vo.NewMonthPeriod(b.Month) }
