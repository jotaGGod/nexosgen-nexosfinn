package dashboard

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/application/dto"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	"github.com/jacks/finapp/backend/internal/domain/service"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// defaultRecentLimit e a quantidade de lancamentos recentes do dashboard.
const defaultRecentLimit = 5

// maxDashboardGoals limita as metas exibidas no card lateral.
const maxDashboardGoals = 3

// GetDashboardUseCase compoe a tela inicial inteira em uma unica resposta.
//
// Ele orquestra os casos de uso especializados em vez de reimplementar as
// agregacoes: cada pedaco do dashboard continua utilizavel isoladamente.
type GetDashboardUseCase struct {
	summary      *GetSummaryUseCase
	cashflow     *GetCashflowUseCase
	byCategory   *GetByCategoryUseCase
	transactions repository.TransactionRepository
	categories   repository.CategoryRepository
	accounts     repository.AccountRepository
	goals        repository.GoalRepository
}

// NewGetDashboardUseCase monta o caso de uso com suas dependencias.
func NewGetDashboardUseCase(
	summary *GetSummaryUseCase,
	cashflow *GetCashflowUseCase,
	byCategory *GetByCategoryUseCase,
	transactions repository.TransactionRepository,
	categories repository.CategoryRepository,
	accounts repository.AccountRepository,
	goals repository.GoalRepository,
) *GetDashboardUseCase {
	return &GetDashboardUseCase{
		summary:      summary,
		cashflow:     cashflow,
		byCategory:   byCategory,
		transactions: transactions,
		categories:   categories,
		accounts:     accounts,
		goals:        goals,
	}
}

// Execute monta resumo, fluxo de caixa, distribuicao por categoria,
// lancamentos recentes e progresso das metas.
func (uc *GetDashboardUseCase) Execute(ctx context.Context, userID uuid.UUID, input dto.DashboardInput) (*dto.DashboardOutput, error) {
	now := time.Now().UTC()

	period, err := input.Period.Resolve(now)
	if err != nil {
		return nil, err
	}

	summary, err := uc.summary.Execute(ctx, userID, period)
	if err != nil {
		return nil, err
	}

	cashflow, err := uc.cashflow.Execute(ctx, userID, period.End(), input.CashflowMonths)
	if err != nil {
		return nil, err
	}

	expenses, err := uc.byCategory.Execute(ctx, userID, period, vo.TransactionTypeExpense)
	if err != nil {
		return nil, err
	}

	recent, err := uc.recentTransactions(ctx, userID, input.RecentLimit)
	if err != nil {
		return nil, err
	}

	goals, err := uc.goalSummaries(ctx, userID, now)
	if err != nil {
		return nil, err
	}

	return &dto.DashboardOutput{
		Summary:            summary,
		Cashflow:           cashflow,
		CategoryExpenses:   expenses,
		RecentTransactions: recent,
		Goals:              goals,
	}, nil
}

// recentTransactions devolve os ultimos lancamentos, independentemente do
// periodo selecionado: o card mostra a atividade mais recente da conta.
func (uc *GetDashboardUseCase) recentTransactions(ctx context.Context, userID uuid.UUID, limit int) ([]dto.TransactionOutput, error) {
	if limit < 1 {
		limit = defaultRecentLimit
	}

	page, err := uc.transactions.List(ctx, repository.TransactionFilter{
		UserID:   userID,
		Page:     1,
		PageSize: limit,
		SortBy:   "occurred_on",
		SortDir:  "desc",
	})
	if err != nil {
		return nil, err
	}

	categoryIndex, err := loadCategoryIndex(ctx, userID, uc.categories)
	if err != nil {
		return nil, err
	}

	accountList, err := uc.accounts.ListByUser(ctx, userID, true)
	if err != nil {
		return nil, err
	}
	accountIndex := make(map[uuid.UUID]*entity.Account, len(accountList))
	for _, account := range accountList {
		accountIndex[account.ID] = account
	}

	items := make([]dto.TransactionOutput, 0, len(page.Items))
	for _, item := range page.Items {
		items = append(items, dto.ToTransactionOutput(item, categoryIndex[item.CategoryID], accountIndex[item.AccountID]))
	}
	return items, nil
}

// goalSummaries devolve as metas em andamento mais avancadas.
func (uc *GetDashboardUseCase) goalSummaries(ctx context.Context, userID uuid.UUID, now time.Time) ([]dto.GoalSummaryOutput, error) {
	found, err := uc.goals.ListByUser(ctx, userID, false)
	if err != nil {
		return nil, err
	}

	items := make([]dto.GoalSummaryOutput, 0, maxDashboardGoals)
	for _, goal := range found {
		if len(items) == maxDashboardGoals {
			break
		}

		progress := service.CalculateGoalProgress(goal, now)
		items = append(items, dto.GoalSummaryOutput{
			ID:            goal.ID.String(),
			Name:          goal.Name,
			CurrentAmount: dto.ToMoneyOutput(goal.CurrentAmount),
			TargetAmount:  dto.ToMoneyOutput(goal.TargetAmount),
			Percentage:    progress.Percentage,
			Color:         goal.Color,
		})
	}
	return items, nil
}
