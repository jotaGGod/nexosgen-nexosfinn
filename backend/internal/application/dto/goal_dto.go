package dto

import (
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/entity"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/domain/service"
)

// CreateGoalInput e o payload de criacao de meta.
type CreateGoalInput struct {
	Name          string  `json:"name"`
	TargetAmount  float64 `json:"target_amount"`
	CurrentAmount float64 `json:"current_amount"`
	Deadline      string  `json:"deadline"`
	ImageURL      string  `json:"image_url"`
	Icon          string  `json:"icon"`
	Color         string  `json:"color"`
}

// UpdateGoalInput e o payload de atualizacao de meta.
type UpdateGoalInput struct {
	Name          string  `json:"name"`
	TargetAmount  float64 `json:"target_amount"`
	CurrentAmount float64 `json:"current_amount"`
	Deadline      string  `json:"deadline"`
	ImageURL      string  `json:"image_url"`
	Icon          string  `json:"icon"`
	Color         string  `json:"color"`
	Archived      bool    `json:"archived"`
}

// ContributeGoalInput registra um aporte na meta.
type ContributeGoalInput struct {
	Amount float64 `json:"amount"`
}

// GoalOutput e a projecao da meta com o progresso ja calculado, para que a
// barra e os rotulos da interface sejam apenas renderizacao.
type GoalOutput struct {
	ID               string      `json:"id"`
	Name             string      `json:"name"`
	TargetAmount     MoneyOutput `json:"target_amount"`
	CurrentAmount    MoneyOutput `json:"current_amount"`
	Remaining        MoneyOutput `json:"remaining"`
	SuggestedMonthly MoneyOutput `json:"suggested_monthly"`
	Percentage       float64     `json:"percentage"`
	MonthsRemaining  int         `json:"months_remaining"`
	Completed        bool        `json:"completed"`
	Overdue          bool        `json:"overdue"`
	Deadline         string      `json:"deadline"`
	ImageURL         string      `json:"image_url"`
	Icon             string      `json:"icon"`
	Color            string      `json:"color"`
	Archived         bool        `json:"archived"`
}

// ToGoalOutput serializa a meta junto do seu progresso.
func ToGoalOutput(goal *entity.Goal, progress service.GoalProgress) GoalOutput {
	return GoalOutput{
		ID:               goal.ID.String(),
		Name:             goal.Name,
		TargetAmount:     ToMoneyOutput(goal.TargetAmount),
		CurrentAmount:    ToMoneyOutput(goal.CurrentAmount),
		Remaining:        ToMoneyOutput(progress.Remaining),
		SuggestedMonthly: ToMoneyOutput(progress.SuggestedMonthly),
		Percentage:       progress.Percentage,
		MonthsRemaining:  progress.MonthsRemaining,
		Completed:        progress.Completed,
		Overdue:          progress.Overdue,
		Deadline:         FormatOptionalDate(goal.Deadline),
		ImageURL:         goal.ImageURL,
		Icon:             goal.Icon,
		Color:            goal.Color,
		Archived:         goal.Archived,
	}
}
