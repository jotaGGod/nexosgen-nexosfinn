// Package fakes fornece implementacoes em memoria dos contratos de
// repositorio, usadas nos testes dos casos de uso.
//
// Os casos de uso dependem apenas das interfaces de domain/repository, entao
// substituir Postgres por estes fakes exercita a regra de negocio inteira sem
// banco, sem Docker e em milissegundos.
package fakes

import (
	"context"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/jacks/finapp/backend/internal/domain/entity"
	domainerr "github.com/jacks/finapp/backend/internal/domain/errors"
	"github.com/jacks/finapp/backend/internal/domain/repository"
	vo "github.com/jacks/finapp/backend/internal/domain/valueobject"
)

// Store guarda todas as entidades em memoria e implementa os contratos de
// repositorio do dominio.
type Store struct {
	mu sync.RWMutex

	Users         []*entity.User
	Accounts      []*entity.Account
	Categories    []*entity.Category
	Transactions  []*entity.Transaction
	Goals         []*entity.Goal
	Budgets       []*entity.Budget
	APIKeys       []*entity.APIKey
	RefreshTokens []*entity.RefreshToken
}

// NewStore cria um repositorio em memoria vazio.
func NewStore() *Store { return &Store{} }

// --- UserRepository ---

func (s *Store) Create(ctx context.Context, user *entity.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, existing := range s.Users {
		if existing.Email.String() == user.Email.String() {
			return domainerr.Conflict("email_already_used", "e-mail ja cadastrado")
		}
	}
	s.Users = append(s.Users, user)
	return nil
}

func (s *Store) Update(ctx context.Context, user *entity.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, existing := range s.Users {
		if existing.ID == user.ID {
			s.Users[i] = user
			return nil
		}
	}
	return domainerr.NotFound("user_not_found", "usuario nao encontrado")
}

func (s *Store) FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, user := range s.Users {
		if user.ID == id {
			return user, nil
		}
	}
	return nil, domainerr.NotFound("user_not_found", "usuario nao encontrado")
}

func (s *Store) FindByEmail(ctx context.Context, email vo.Email) (*entity.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, user := range s.Users {
		if user.Email.String() == email.String() {
			return user, nil
		}
	}
	return nil, domainerr.NotFound("user_not_found", "usuario nao encontrado")
}

func (s *Store) ExistsByEmail(ctx context.Context, email vo.Email) (bool, error) {
	_, err := s.FindByEmail(ctx, email)
	if err != nil {
		if domainerr.Is(err, domainerr.KindNotFound) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

// --- Repositorios especializados ---

// AccountRepo devolve a visao de repositorio de contas.
func (s *Store) AccountRepo() repository.AccountRepository { return &accountRepo{store: s} }

// CategoryRepo devolve a visao de repositorio de categorias.
func (s *Store) CategoryRepo() repository.CategoryRepository { return &categoryRepo{store: s} }

// TransactionRepo devolve a visao de repositorio de lancamentos.
func (s *Store) TransactionRepo() repository.TransactionRepository { return &transactionRepo{store: s} }

// AnalyticsRepo devolve a visao analitica, calculada sobre os lancamentos.
func (s *Store) AnalyticsRepo() repository.TransactionAnalyticsRepository {
	return &analyticsRepo{store: s}
}

// GoalRepo devolve a visao de repositorio de metas.
func (s *Store) GoalRepo() repository.GoalRepository { return &goalRepo{store: s} }

// BudgetRepo devolve a visao de repositorio de orcamentos.
func (s *Store) BudgetRepo() repository.BudgetRepository { return &budgetRepo{store: s} }

// APIKeyRepo devolve a visao de repositorio de chaves de API.
func (s *Store) APIKeyRepo() repository.APIKeyRepository { return &apiKeyRepo{store: s} }

// RefreshTokenRepo devolve a visao de repositorio de refresh tokens.
func (s *Store) RefreshTokenRepo() repository.RefreshTokenRepository {
	return &refreshTokenRepo{store: s}
}

// UserRepo devolve a visao de repositorio de usuarios.
func (s *Store) UserRepo() repository.UserRepository { return s }

// --- Contas ---

type accountRepo struct{ store *Store }

func (r *accountRepo) Create(ctx context.Context, account *entity.Account) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, existing := range r.store.Accounts {
		if existing.UserID == account.UserID && strings.EqualFold(existing.Name, account.Name) {
			return domainerr.Conflict("account_already_exists", "conta ja existe")
		}
	}
	r.store.Accounts = append(r.store.Accounts, account)
	return nil
}

func (r *accountRepo) Update(ctx context.Context, account *entity.Account) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i, existing := range r.store.Accounts {
		if existing.ID == account.ID && existing.UserID == account.UserID {
			r.store.Accounts[i] = account
			return nil
		}
	}
	return domainerr.NotFound("account_not_found", "conta nao encontrada")
}

func (r *accountRepo) Delete(ctx context.Context, userID, id uuid.UUID) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i, existing := range r.store.Accounts {
		if existing.ID == id && existing.UserID == userID {
			r.store.Accounts = append(r.store.Accounts[:i], r.store.Accounts[i+1:]...)
			return nil
		}
	}
	return domainerr.NotFound("account_not_found", "conta nao encontrada")
}

func (r *accountRepo) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Account, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	for _, existing := range r.store.Accounts {
		if existing.ID == id && existing.UserID == userID {
			return existing, nil
		}
	}
	return nil, domainerr.NotFound("account_not_found", "conta nao encontrada")
}

func (r *accountRepo) ListByUser(ctx context.Context, userID uuid.UUID, includeArchived bool) ([]*entity.Account, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	items := make([]*entity.Account, 0, len(r.store.Accounts))
	for _, existing := range r.store.Accounts {
		if existing.UserID != userID || (!includeArchived && existing.Archived) {
			continue
		}
		items = append(items, existing)
	}
	return items, nil
}

func (r *accountRepo) CountTransactions(ctx context.Context, userID, accountID uuid.UUID) (int, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	count := 0
	for _, transaction := range r.store.Transactions {
		if transaction.UserID == userID && transaction.AccountID == accountID {
			count++
		}
	}
	return count, nil
}

// --- Categorias ---

type categoryRepo struct{ store *Store }

func (r *categoryRepo) Create(ctx context.Context, category *entity.Category) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, existing := range r.store.Categories {
		if existing.UserID == category.UserID &&
			strings.EqualFold(existing.Name, category.Name) &&
			existing.Type == category.Type {
			return domainerr.Conflict("category_already_exists", "categoria ja existe")
		}
	}
	r.store.Categories = append(r.store.Categories, category)
	return nil
}

func (r *categoryRepo) Update(ctx context.Context, category *entity.Category) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i, existing := range r.store.Categories {
		if existing.ID == category.ID && existing.UserID == category.UserID {
			r.store.Categories[i] = category
			return nil
		}
	}
	return domainerr.NotFound("category_not_found", "categoria nao encontrada")
}

func (r *categoryRepo) Delete(ctx context.Context, userID, id uuid.UUID) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i, existing := range r.store.Categories {
		if existing.ID == id && existing.UserID == userID {
			r.store.Categories = append(r.store.Categories[:i], r.store.Categories[i+1:]...)
			return nil
		}
	}
	return domainerr.NotFound("category_not_found", "categoria nao encontrada")
}

func (r *categoryRepo) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Category, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	for _, existing := range r.store.Categories {
		if existing.ID == id && existing.UserID == userID {
			return existing, nil
		}
	}
	return nil, domainerr.NotFound("category_not_found", "categoria nao encontrada")
}

func (r *categoryRepo) ListByUser(ctx context.Context, userID uuid.UUID, categoryType *vo.TransactionType, includeArchived bool) ([]*entity.Category, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	items := make([]*entity.Category, 0, len(r.store.Categories))
	for _, existing := range r.store.Categories {
		if existing.UserID != userID || (!includeArchived && existing.Archived) {
			continue
		}
		if categoryType != nil && existing.Type != *categoryType {
			continue
		}
		items = append(items, existing)
	}
	return items, nil
}

func (r *categoryRepo) CountTransactions(ctx context.Context, userID, categoryID uuid.UUID) (int, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	count := 0
	for _, transaction := range r.store.Transactions {
		if transaction.UserID == userID && transaction.CategoryID == categoryID {
			count++
		}
	}
	return count, nil
}

// --- Lancamentos ---

type transactionRepo struct{ store *Store }

func (r *transactionRepo) Create(ctx context.Context, transaction *entity.Transaction) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	r.store.Transactions = append(r.store.Transactions, transaction)
	return nil
}

func (r *transactionRepo) Update(ctx context.Context, transaction *entity.Transaction) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i, existing := range r.store.Transactions {
		if existing.ID == transaction.ID && existing.UserID == transaction.UserID {
			r.store.Transactions[i] = transaction
			return nil
		}
	}
	return domainerr.NotFound("transaction_not_found", "lancamento nao encontrado")
}

func (r *transactionRepo) Delete(ctx context.Context, userID, id uuid.UUID) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i, existing := range r.store.Transactions {
		if existing.ID == id && existing.UserID == userID {
			r.store.Transactions = append(r.store.Transactions[:i], r.store.Transactions[i+1:]...)
			return nil
		}
	}
	return domainerr.NotFound("transaction_not_found", "lancamento nao encontrado")
}

func (r *transactionRepo) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Transaction, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	for _, existing := range r.store.Transactions {
		if existing.ID == id && existing.UserID == userID {
			return existing, nil
		}
	}
	return nil, domainerr.NotFound("transaction_not_found", "lancamento nao encontrado")
}

func (r *transactionRepo) List(ctx context.Context, filter repository.TransactionFilter) (repository.TransactionPage, error) {
	matched := r.match(filter)

	sort.SliceStable(matched, func(i, j int) bool {
		if filter.SortBy == "amount" {
			if filter.SortDir == "asc" {
				return matched[i].Amount.Cents() < matched[j].Amount.Cents()
			}
			return matched[i].Amount.Cents() > matched[j].Amount.Cents()
		}
		if filter.SortDir == "asc" {
			return matched[i].OccurredOn.Before(matched[j].OccurredOn)
		}
		return matched[i].OccurredOn.After(matched[j].OccurredOn)
	})

	total := len(matched)
	start := (filter.Page - 1) * filter.PageSize
	if start > total {
		start = total
	}
	end := start + filter.PageSize
	if end > total {
		end = total
	}

	return repository.TransactionPage{
		Items:    matched[start:end],
		Total:    total,
		Page:     filter.Page,
		PageSize: filter.PageSize,
	}, nil
}

func (r *transactionRepo) FilterTotals(ctx context.Context, filter repository.TransactionFilter) (repository.Totals, error) {
	totals := repository.Totals{}
	for _, transaction := range r.match(filter) {
		totals.Count++
		if transaction.Type.IsIncome() {
			totals.Income = totals.Income.Add(transaction.Amount)
		} else {
			totals.Expense = totals.Expense.Add(transaction.Amount)
		}
	}
	return totals, nil
}

func (r *transactionRepo) match(filter repository.TransactionFilter) []*entity.Transaction {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	matched := make([]*entity.Transaction, 0, len(r.store.Transactions))
	for _, transaction := range r.store.Transactions {
		if transaction.UserID != filter.UserID {
			continue
		}
		if filter.Type != nil && transaction.Type != *filter.Type {
			continue
		}
		if filter.Period != nil && !filter.Period.Contains(transaction.OccurredOn) {
			continue
		}
		if filter.Search != "" && !strings.Contains(
			strings.ToLower(transaction.Description), strings.ToLower(filter.Search)) {
			continue
		}
		if len(filter.CategoryIDs) > 0 && !containsID(filter.CategoryIDs, transaction.CategoryID) {
			continue
		}
		if len(filter.AccountIDs) > 0 && !containsID(filter.AccountIDs, transaction.AccountID) {
			continue
		}
		matched = append(matched, transaction)
	}
	return matched
}

func containsID(ids []uuid.UUID, target uuid.UUID) bool {
	for _, id := range ids {
		if id == target {
			return true
		}
	}
	return false
}

// --- Analitico ---

type analyticsRepo struct{ store *Store }

func (r *analyticsRepo) forUser(userID uuid.UUID) []*entity.Transaction {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	items := make([]*entity.Transaction, 0, len(r.store.Transactions))
	for _, transaction := range r.store.Transactions {
		if transaction.UserID == userID {
			items = append(items, transaction)
		}
	}
	return items
}

func (r *analyticsRepo) Totals(ctx context.Context, userID uuid.UUID, period vo.Period) (repository.Totals, error) {
	totals := repository.Totals{}
	for _, transaction := range r.forUser(userID) {
		if !period.Contains(transaction.OccurredOn) {
			continue
		}
		totals.Count++
		if transaction.Type.IsIncome() {
			totals.Income = totals.Income.Add(transaction.Amount)
		} else {
			totals.Expense = totals.Expense.Add(transaction.Amount)
		}
	}
	return totals, nil
}

func (r *analyticsRepo) TotalsByCategory(ctx context.Context, userID uuid.UUID, period vo.Period) ([]repository.CategoryTotal, error) {
	type key struct {
		categoryID uuid.UUID
		kind       vo.TransactionType
	}

	aggregated := map[key]repository.CategoryTotal{}
	for _, transaction := range r.forUser(userID) {
		if !period.Contains(transaction.OccurredOn) {
			continue
		}
		k := key{transaction.CategoryID, transaction.Type}
		item := aggregated[k]
		item.CategoryID = transaction.CategoryID
		item.Type = transaction.Type
		item.Total = item.Total.Add(transaction.Amount)
		item.Count++
		aggregated[k] = item
	}

	items := make([]repository.CategoryTotal, 0, len(aggregated))
	for _, item := range aggregated {
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool { return items[i].Total.GreaterThan(items[j].Total) })
	return items, nil
}

func (r *analyticsRepo) MonthlySeries(ctx context.Context, userID uuid.UUID, period vo.Period) ([]repository.MonthlyTotal, error) {
	aggregated := map[time.Time]repository.MonthlyTotal{}
	for _, transaction := range r.forUser(userID) {
		if !period.Contains(transaction.OccurredOn) {
			continue
		}
		month := entity.NormalizeMonth(transaction.OccurredOn)
		item := aggregated[month]
		item.Month = month
		if transaction.Type.IsIncome() {
			item.Income = item.Income.Add(transaction.Amount)
		} else {
			item.Expense = item.Expense.Add(transaction.Amount)
		}
		aggregated[month] = item
	}

	items := make([]repository.MonthlyTotal, 0, len(aggregated))
	for _, item := range aggregated {
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool { return items[i].Month.Before(items[j].Month) })
	return items, nil
}

func (r *analyticsRepo) DailySeries(ctx context.Context, userID uuid.UUID, period vo.Period) ([]repository.DailyTotal, error) {
	aggregated := map[time.Time]repository.DailyTotal{}
	for _, transaction := range r.forUser(userID) {
		if !period.Contains(transaction.OccurredOn) {
			continue
		}
		day := transaction.OccurredOn
		item := aggregated[day]
		item.Day = day
		if transaction.Type.IsIncome() {
			item.Income = item.Income.Add(transaction.Amount)
		} else {
			item.Expense = item.Expense.Add(transaction.Amount)
		}
		aggregated[day] = item
	}

	items := make([]repository.DailyTotal, 0, len(aggregated))
	for _, item := range aggregated {
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool { return items[i].Day.Before(items[j].Day) })
	return items, nil
}

func (r *analyticsRepo) NetUntil(ctx context.Context, userID uuid.UUID, until time.Time) (vo.Money, error) {
	net := vo.ZeroMoney
	for _, transaction := range r.forUser(userID) {
		if transaction.OccurredOn.After(vo.TruncateToDay(until)) {
			continue
		}
		net = net.Add(transaction.SignedAmount())
	}
	return net, nil
}

func (r *analyticsRepo) NetByAccount(ctx context.Context, userID uuid.UUID) (map[uuid.UUID]vo.Money, error) {
	net := map[uuid.UUID]vo.Money{}
	for _, transaction := range r.forUser(userID) {
		net[transaction.AccountID] = net[transaction.AccountID].Add(transaction.SignedAmount())
	}
	return net, nil
}

func (r *analyticsRepo) Extremes(ctx context.Context, userID uuid.UUID, period vo.Period, transactionType vo.TransactionType) (*entity.Transaction, *entity.Transaction, error) {
	var highest, lowest *entity.Transaction
	for _, transaction := range r.forUser(userID) {
		if transaction.Type != transactionType || !period.Contains(transaction.OccurredOn) {
			continue
		}
		if highest == nil || transaction.Amount.GreaterThan(highest.Amount) {
			highest = transaction
		}
		if lowest == nil || lowest.Amount.GreaterThan(transaction.Amount) {
			lowest = transaction
		}
	}
	return highest, lowest, nil
}

// --- Metas ---

type goalRepo struct{ store *Store }

func (r *goalRepo) Create(ctx context.Context, goal *entity.Goal) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	r.store.Goals = append(r.store.Goals, goal)
	return nil
}

func (r *goalRepo) Update(ctx context.Context, goal *entity.Goal) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i, existing := range r.store.Goals {
		if existing.ID == goal.ID && existing.UserID == goal.UserID {
			r.store.Goals[i] = goal
			return nil
		}
	}
	return domainerr.NotFound("goal_not_found", "meta nao encontrada")
}

func (r *goalRepo) Delete(ctx context.Context, userID, id uuid.UUID) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i, existing := range r.store.Goals {
		if existing.ID == id && existing.UserID == userID {
			r.store.Goals = append(r.store.Goals[:i], r.store.Goals[i+1:]...)
			return nil
		}
	}
	return domainerr.NotFound("goal_not_found", "meta nao encontrada")
}

func (r *goalRepo) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Goal, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	for _, existing := range r.store.Goals {
		if existing.ID == id && existing.UserID == userID {
			return existing, nil
		}
	}
	return nil, domainerr.NotFound("goal_not_found", "meta nao encontrada")
}

func (r *goalRepo) ListByUser(ctx context.Context, userID uuid.UUID, includeArchived bool) ([]*entity.Goal, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	items := make([]*entity.Goal, 0, len(r.store.Goals))
	for _, existing := range r.store.Goals {
		if existing.UserID != userID || (!includeArchived && existing.Archived) {
			continue
		}
		items = append(items, existing)
	}
	return items, nil
}

// --- Orcamentos ---

type budgetRepo struct{ store *Store }

func (r *budgetRepo) Create(ctx context.Context, budget *entity.Budget) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, existing := range r.store.Budgets {
		if existing.UserID == budget.UserID &&
			existing.CategoryID == budget.CategoryID &&
			existing.Month.Equal(budget.Month) {
			return domainerr.Conflict("budget_already_exists", "orcamento ja existe")
		}
	}
	r.store.Budgets = append(r.store.Budgets, budget)
	return nil
}

func (r *budgetRepo) Update(ctx context.Context, budget *entity.Budget) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i, existing := range r.store.Budgets {
		if existing.ID == budget.ID && existing.UserID == budget.UserID {
			r.store.Budgets[i] = budget
			return nil
		}
	}
	return domainerr.NotFound("budget_not_found", "orcamento nao encontrado")
}

func (r *budgetRepo) Delete(ctx context.Context, userID, id uuid.UUID) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i, existing := range r.store.Budgets {
		if existing.ID == id && existing.UserID == userID {
			r.store.Budgets = append(r.store.Budgets[:i], r.store.Budgets[i+1:]...)
			return nil
		}
	}
	return domainerr.NotFound("budget_not_found", "orcamento nao encontrado")
}

func (r *budgetRepo) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.Budget, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	for _, existing := range r.store.Budgets {
		if existing.ID == id && existing.UserID == userID {
			return existing, nil
		}
	}
	return nil, domainerr.NotFound("budget_not_found", "orcamento nao encontrado")
}

func (r *budgetRepo) FindByCategoryAndMonth(ctx context.Context, userID, categoryID uuid.UUID, month time.Time) (*entity.Budget, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	normalized := entity.NormalizeMonth(month)
	for _, existing := range r.store.Budgets {
		if existing.UserID == userID && existing.CategoryID == categoryID && existing.Month.Equal(normalized) {
			return existing, nil
		}
	}
	return nil, domainerr.NotFound("budget_not_found", "orcamento nao encontrado")
}

func (r *budgetRepo) ListByMonth(ctx context.Context, userID uuid.UUID, month time.Time) ([]*entity.Budget, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	normalized := entity.NormalizeMonth(month)
	items := make([]*entity.Budget, 0, len(r.store.Budgets))
	for _, existing := range r.store.Budgets {
		if existing.UserID == userID && existing.Month.Equal(normalized) {
			items = append(items, existing)
		}
	}
	return items, nil
}

// --- Chaves de API ---

type apiKeyRepo struct{ store *Store }

func (r *apiKeyRepo) Create(ctx context.Context, key *entity.APIKey) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	r.store.APIKeys = append(r.store.APIKeys, key)
	return nil
}

func (r *apiKeyRepo) ListByUser(ctx context.Context, userID uuid.UUID) ([]*entity.APIKey, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	items := make([]*entity.APIKey, 0, len(r.store.APIKeys))
	for _, existing := range r.store.APIKeys {
		if existing.UserID == userID {
			items = append(items, existing)
		}
	}
	return items, nil
}

func (r *apiKeyRepo) FindByID(ctx context.Context, userID, id uuid.UUID) (*entity.APIKey, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	for _, existing := range r.store.APIKeys {
		if existing.ID == id && existing.UserID == userID {
			return existing, nil
		}
	}
	return nil, domainerr.NotFound("api_key_not_found", "chave nao encontrada")
}

func (r *apiKeyRepo) FindByHash(ctx context.Context, keyHash string) (*entity.APIKey, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	for _, existing := range r.store.APIKeys {
		if existing.KeyHash == keyHash {
			return existing, nil
		}
	}
	return nil, domainerr.NotFound("api_key_not_found", "chave nao encontrada")
}

func (r *apiKeyRepo) Revoke(ctx context.Context, key *entity.APIKey) error        { return nil }
func (r *apiKeyRepo) TouchLastUsed(ctx context.Context, key *entity.APIKey) error { return nil }

// --- Refresh tokens ---

type refreshTokenRepo struct{ store *Store }

func (r *refreshTokenRepo) Create(ctx context.Context, token *entity.RefreshToken) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	r.store.RefreshTokens = append(r.store.RefreshTokens, token)
	return nil
}

func (r *refreshTokenRepo) FindByHash(ctx context.Context, tokenHash string) (*entity.RefreshToken, error) {
	r.store.mu.RLock()
	defer r.store.mu.RUnlock()

	for _, existing := range r.store.RefreshTokens {
		if existing.TokenHash == tokenHash {
			return existing, nil
		}
	}
	return nil, domainerr.NotFound("refresh_token_not_found", "token nao encontrado")
}

func (r *refreshTokenRepo) Revoke(ctx context.Context, token *entity.RefreshToken) error { return nil }

func (r *refreshTokenRepo) RevokeAllForUser(ctx context.Context, userID uuid.UUID) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	now := time.Now().UTC()
	for _, existing := range r.store.RefreshTokens {
		if existing.UserID == userID {
			existing.Revoke(now)
		}
	}
	return nil
}

func (r *refreshTokenRepo) DeleteExpired(ctx context.Context) error { return nil }
