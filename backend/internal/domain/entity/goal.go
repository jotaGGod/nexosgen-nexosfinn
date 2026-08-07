package entity

import (
	"strings"
	"time"

	"github.com/google/uuid"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
)

// Goal e um objetivo financeiro do usuario, como uma viagem ou uma reserva
// de emergencia.
//
// O calculo de progresso, prazo restante e aporte mensal sugerido vive em
// domain/service/goal_progress.go: a entidade cuida apenas do estado e das
// suas invariantes.
type Goal struct {
	ID            uuid.UUID
	UserID        uuid.UUID
	Name          string
	TargetAmount  vo.Money
	CurrentAmount vo.Money
	Deadline      *time.Time
	ImageURL      string
	Icon          string
	Color         string
	Archived      bool
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// NewGoal cria uma meta validada.
func NewGoal(
	userID uuid.UUID,
	name string,
	targetAmount, currentAmount vo.Money,
	deadline *time.Time,
	imageURL, icon, color string,
) (*Goal, error) {
	goal := &Goal{
		ID:        uuid.New(),
		UserID:    userID,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}

	if err := goal.apply(name, targetAmount, currentAmount, deadline, imageURL, icon, color); err != nil {
		return nil, err
	}
	return goal, nil
}

// Update aplica alteracoes validadas na meta.
func (g *Goal) Update(
	name string,
	targetAmount, currentAmount vo.Money,
	deadline *time.Time,
	imageURL, icon, color string,
) error {
	if err := g.apply(name, targetAmount, currentAmount, deadline, imageURL, icon, color); err != nil {
		return err
	}
	g.UpdatedAt = time.Now().UTC()
	return nil
}

func (g *Goal) apply(
	name string,
	targetAmount, currentAmount vo.Money,
	deadline *time.Time,
	imageURL, icon, color string,
) error {
	normalizedName, err := normalizeName(name, "name", "nome da meta")
	if err != nil {
		return err
	}

	if !targetAmount.IsPositive() {
		return domainerr.InvalidInput("invalid_target_amount", "valor alvo deve ser maior que zero")
	}
	if currentAmount.IsNegative() {
		return domainerr.InvalidInput("invalid_current_amount", "valor acumulado nao pode ser negativo")
	}

	normalizedColor, err := normalizeColor(color)
	if err != nil {
		return err
	}

	normalizedIcon, err := normalizeIcon(icon, "target")
	if err != nil {
		return err
	}

	trimmedImage := strings.TrimSpace(imageURL)
	if len(trimmedImage) > 500 {
		return domainerr.InvalidInput("invalid_image_url", "URL da imagem excede o tamanho maximo")
	}

	var normalizedDeadline *time.Time
	if deadline != nil && !deadline.IsZero() {
		truncated := vo.TruncateToDay(*deadline)
		normalizedDeadline = &truncated
	}

	g.Name = normalizedName
	g.TargetAmount = targetAmount
	g.CurrentAmount = currentAmount
	g.Deadline = normalizedDeadline
	g.ImageURL = trimmedImage
	g.Icon = normalizedIcon
	g.Color = normalizedColor
	return nil
}

// Contribute soma um aporte ao valor acumulado. Aportes negativos sao
// permitidos (correcao de lancamento), desde que o acumulado nao fique negativo.
func (g *Goal) Contribute(amount vo.Money) error {
	if amount.IsZero() {
		return domainerr.InvalidInput("invalid_amount", "valor do aporte deve ser diferente de zero")
	}

	updated := g.CurrentAmount.Add(amount)
	if updated.IsNegative() {
		return domainerr.InvalidInput("invalid_current_amount", "valor acumulado nao pode ficar negativo")
	}

	g.CurrentAmount = updated
	g.UpdatedAt = time.Now().UTC()
	return nil
}

// IsCompleted reporta se a meta ja atingiu o valor alvo.
func (g *Goal) IsCompleted() bool {
	return g.CurrentAmount.Cents() >= g.TargetAmount.Cents()
}

// Archive esconde a meta das listagens.
func (g *Goal) Archive() {
	g.Archived = true
	g.UpdatedAt = time.Now().UTC()
}
