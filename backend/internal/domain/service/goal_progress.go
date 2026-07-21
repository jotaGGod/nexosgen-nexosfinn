package service

import (
	"math"
	"time"

	"github.com/jacks/finapp/backend/internal/domain/entity"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// GoalProgress e a leitura calculada de uma meta, exibida na barra de
// progresso e nos rotulos "Restam X meses" e "R$ Y/mes".
type GoalProgress struct {
	Percentage       float64
	Remaining        vo.Money
	MonthsRemaining  int
	SuggestedMonthly vo.Money
	Completed        bool
	Overdue          bool
}

// CalculateGoalProgress deriva o progresso de uma meta em um dado instante.
//
// O aporte sugerido reparte o que falta pelos meses restantes; sem prazo
// definido (ou com prazo vencido) o valor sugerido e o proprio saldo faltante.
func CalculateGoalProgress(goal *entity.Goal, now time.Time) GoalProgress {
	remaining := goal.TargetAmount.Sub(goal.CurrentAmount)
	if remaining.IsNegative() {
		remaining = vo.ZeroMoney
	}

	percentage := goal.CurrentAmount.PercentageOf(goal.TargetAmount)
	percentage = math.Min(percentage, 100)

	progress := GoalProgress{
		Percentage: percentage,
		Remaining:  remaining,
		Completed:  goal.IsCompleted(),
	}

	if goal.Deadline != nil {
		progress.MonthsRemaining = vo.MonthsUntil(now, *goal.Deadline)
		progress.Overdue = !progress.Completed && !goal.Deadline.After(vo.TruncateToDay(now))
	}

	if progress.Completed {
		return progress
	}

	if progress.MonthsRemaining > 0 {
		progress.SuggestedMonthly = remaining.DivideBy(progress.MonthsRemaining)
	} else {
		progress.SuggestedMonthly = remaining
	}

	return progress
}
