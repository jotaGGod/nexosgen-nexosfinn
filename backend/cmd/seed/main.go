// Command seed popula o banco com um usuario de demonstracao e um historico
// financeiro realista.
//
// Existe para que a aplicacao possa ser avaliada com graficos preenchidos em
// vez de telas vazias. E idempotente: rodar duas vezes nao duplica nada.
package main

import (
	"context"
	"fmt"
	"log/slog"
	"math/rand"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/config"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/entity"
	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/repository"
	vo "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/valueobject"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/infrastructure/auth"
	"github.com/jotaGGod/nexosgen-financehub/backend/internal/infrastructure/persistence/postgres"
)

const (
	demoName     = "Joao Silva"
	demoEmail    = "joao@email.com"
	demoPassword = "financas123"
)

func main() {
	if err := run(); err != nil {
		slog.Error("falha ao popular o banco", slog.Any("error", err))
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	ctx := context.Background()

	pool, err := postgres.Connect(ctx, cfg.DatabaseURL, 10)
	if err != nil {
		return err
	}
	defer pool.Close()

	users := postgres.NewUserRepository(pool)
	accounts := postgres.NewAccountRepository(pool)
	categories := postgres.NewCategoryRepository(pool)
	transactions := postgres.NewTransactionRepository(pool)
	goals := postgres.NewGoalRepository(pool)
	budgets := postgres.NewBudgetRepository(pool)

	email, err := vo.NewEmail(demoEmail)
	if err != nil {
		return err
	}

	if exists, err := users.ExistsByEmail(ctx, email); err != nil {
		return err
	} else if exists {
		fmt.Printf("usuario de demonstracao ja existe: %s\n", demoEmail)
		return nil
	}

	hasher := auth.NewBcryptHasher(0)
	passwordHash, err := hasher.Hash(demoPassword)
	if err != nil {
		return err
	}

	user, err := entity.NewUser(demoName, demoEmail, passwordHash)
	if err != nil {
		return err
	}
	if err := users.Create(ctx, user); err != nil {
		return err
	}

	createdAccounts, err := seedAccounts(ctx, user.ID, accounts)
	if err != nil {
		return err
	}

	createdCategories, err := seedCategories(ctx, user.ID, categories)
	if err != nil {
		return err
	}

	count, err := seedTransactions(ctx, user.ID, createdAccounts, createdCategories, transactions)
	if err != nil {
		return err
	}

	if err := seedGoals(ctx, user.ID, goals); err != nil {
		return err
	}

	if err := seedBudgets(ctx, user.ID, createdCategories, budgets); err != nil {
		return err
	}

	fmt.Printf("dados de demonstracao criados\n")
	fmt.Printf("  e-mail: %s\n", demoEmail)
	fmt.Printf("  senha:  %s\n", demoPassword)
	fmt.Printf("  %d lancamentos, %d categorias, %d contas\n",
		count, len(createdCategories), len(createdAccounts))
	return nil
}

func seedAccounts(ctx context.Context, userID uuid.UUID, repo repository.AccountRepository) (map[string]*entity.Account, error) {
	definitions := []struct {
		name           string
		accountType    vo.AccountType
		initialBalance int64
		color          string
		icon           string
	}{
		{"Conta Corrente", vo.AccountTypeChecking, 850000, "#7C3AED", "landmark"},
		{"Poupanca", vo.AccountTypeSavings, 1200000, "#10B981", "piggy-bank"},
		{"Cartao Nubank", vo.AccountTypeCreditCard, 0, "#EC4899", "credit-card"},
		{"Carteira", vo.AccountTypeCash, 30000, "#F59E0B", "wallet"},
	}

	created := make(map[string]*entity.Account, len(definitions))
	for _, definition := range definitions {
		account, err := entity.NewAccount(
			userID, definition.name, definition.accountType,
			vo.NewMoney(definition.initialBalance), definition.color, definition.icon)
		if err != nil {
			return nil, err
		}
		if err := repo.Create(ctx, account); err != nil {
			return nil, err
		}
		created[definition.name] = account
	}
	return created, nil
}

func seedCategories(ctx context.Context, userID uuid.UUID, repo repository.CategoryRepository) (map[string]*entity.Category, error) {
	definitions := []struct {
		name         string
		categoryType vo.TransactionType
		color        string
		icon         string
	}{
		{"Salario", vo.TransactionTypeIncome, "#10B981", "wallet"},
		{"Freelance", vo.TransactionTypeIncome, "#22C55E", "briefcase"},
		{"Investimentos", vo.TransactionTypeIncome, "#14B8A6", "trending-up"},
		{"Moradia", vo.TransactionTypeExpense, "#7C3AED", "home"},
		{"Alimentacao", vo.TransactionTypeExpense, "#10B981", "utensils"},
		{"Transporte", vo.TransactionTypeExpense, "#F59E0B", "car"},
		{"Saude", vo.TransactionTypeExpense, "#EC4899", "heart-pulse"},
		{"Lazer", vo.TransactionTypeExpense, "#38BDF8", "party-popper"},
		{"Educacao", vo.TransactionTypeExpense, "#6366F1", "graduation-cap"},
		{"Outros", vo.TransactionTypeExpense, "#94A3B8", "ellipsis"},
	}

	created := make(map[string]*entity.Category, len(definitions))
	for _, definition := range definitions {
		category, err := entity.NewCategory(userID, definition.name, definition.categoryType, definition.color, definition.icon)
		if err != nil {
			return nil, err
		}
		if err := repo.Create(ctx, category); err != nil {
			return nil, err
		}
		created[definition.name] = category
	}
	return created, nil
}

// recurring descreve um lancamento que se repete todo mes.
type recurring struct {
	description string
	category    string
	account     string
	kind        vo.TransactionType
	amount      int64
	day         int
	// variation e a oscilacao maxima aplicada ao valor, em centavos, para que
	// os graficos nao fiquem com linhas perfeitamente retas.
	variation int64
}

// occasional descreve um lancamento pontual em um mes especifico.
type occasional struct {
	description string
	category    string
	account     string
	kind        vo.TransactionType
	amount      int64
	monthsAgo   int
	day         int
}

func seedTransactions(
	ctx context.Context,
	userID uuid.UUID,
	accounts map[string]*entity.Account,
	categories map[string]*entity.Category,
	repo repository.TransactionRepository,
) (int, error) {
	// Semente fixa: o mesmo comando produz sempre o mesmo historico, o que
	// torna qualquer verificacao reproduzivel.
	random := rand.New(rand.NewSource(20240531))

	recurrings := []recurring{
		{"Salario", "Salario", "Conta Corrente", vo.TransactionTypeIncome, 850000, 5, 0},
		{"Aluguel", "Moradia", "Conta Corrente", vo.TransactionTypeExpense, 250000, 10, 0},
		{"Supermercado", "Alimentacao", "Cartao Nubank", vo.TransactionTypeExpense, 78000, 8, 25000},
		{"Supermercado", "Alimentacao", "Cartao Nubank", vo.TransactionTypeExpense, 65000, 22, 20000},
		{"Conta de luz", "Moradia", "Conta Corrente", vo.TransactionTypeExpense, 18500, 15, 6000},
		{"Internet", "Moradia", "Conta Corrente", vo.TransactionTypeExpense, 12990, 12, 0},
		{"Uber", "Transporte", "Cartao Nubank", vo.TransactionTypeExpense, 8500, 7, 4000},
		{"Uber", "Transporte", "Cartao Nubank", vo.TransactionTypeExpense, 7200, 19, 3500},
		{"Combustivel", "Transporte", "Cartao Nubank", vo.TransactionTypeExpense, 32000, 14, 8000},
		{"Plano de saude", "Saude", "Conta Corrente", vo.TransactionTypeExpense, 45000, 18, 0},
		{"Netflix", "Lazer", "Cartao Nubank", vo.TransactionTypeExpense, 4500, 28, 0},
		{"Spotify", "Lazer", "Cartao Nubank", vo.TransactionTypeExpense, 2190, 28, 0},
		{"Restaurante", "Alimentacao", "Cartao Nubank", vo.TransactionTypeExpense, 12500, 24, 7000},
		{"Academia", "Saude", "Conta Corrente", vo.TransactionTypeExpense, 12000, 6, 0},
	}

	occasionals := []occasional{
		{"Freelance Project", "Freelance", "Conta Corrente", vo.TransactionTypeIncome, 125000, 0, 30},
		{"Freelance landing page", "Freelance", "Conta Corrente", vo.TransactionTypeIncome, 90000, 2, 17},
		{"Dividendos", "Investimentos", "Poupanca", vo.TransactionTypeIncome, 34200, 1, 20},
		{"Dividendos", "Investimentos", "Poupanca", vo.TransactionTypeIncome, 28700, 3, 20},
		{"Farmacia", "Saude", "Carteira", vo.TransactionTypeExpense, 6750, 0, 28},
		{"Curso de Go", "Educacao", "Cartao Nubank", vo.TransactionTypeExpense, 49700, 1, 9},
		{"Cinema", "Lazer", "Carteira", vo.TransactionTypeExpense, 9000, 0, 21},
		{"Presente de aniversario", "Outros", "Cartao Nubank", vo.TransactionTypeExpense, 15000, 2, 12},
		{"Manutencao do carro", "Transporte", "Conta Corrente", vo.TransactionTypeExpense, 68000, 3, 11},
		{"Dentista", "Saude", "Conta Corrente", vo.TransactionTypeExpense, 35000, 4, 16},
		{"Viagem fim de semana", "Lazer", "Cartao Nubank", vo.TransactionTypeExpense, 92000, 1, 26},
	}

	now := time.Now().UTC()
	count := 0

	// Cinco meses de historico: o suficiente para o grafico de fluxo de caixa
	// e para os comparativos "vs mes anterior".
	for monthsAgo := 4; monthsAgo >= 0; monthsAgo-- {
		reference := entity.NormalizeMonth(now.AddDate(0, -monthsAgo, 0))

		for _, item := range recurrings {
			amount := item.amount
			if item.variation > 0 {
				amount += random.Int63n(item.variation*2) - item.variation
			}

			occurredOn := dayOfMonth(reference, item.day)
			if occurredOn.After(now) {
				continue
			}

			if err := createTransaction(ctx, repo, userID, accounts[item.account], categories[item.category],
				item.kind, amount, item.description, occurredOn); err != nil {
				return count, err
			}
			count++
		}

		for _, item := range occasionals {
			if item.monthsAgo != monthsAgo {
				continue
			}

			occurredOn := dayOfMonth(reference, item.day)
			if occurredOn.After(now) {
				continue
			}

			if err := createTransaction(ctx, repo, userID, accounts[item.account], categories[item.category],
				item.kind, item.amount, item.description, occurredOn); err != nil {
				return count, err
			}
			count++
		}
	}

	return count, nil
}

// dayOfMonth resolve o dia dentro do mes, respeitando meses mais curtos.
func dayOfMonth(reference time.Time, day int) time.Time {
	lastDay := reference.AddDate(0, 1, -1).Day()
	if day > lastDay {
		day = lastDay
	}
	return time.Date(reference.Year(), reference.Month(), day, 0, 0, 0, 0, time.UTC)
}

func createTransaction(
	ctx context.Context,
	repo repository.TransactionRepository,
	userID uuid.UUID,
	account *entity.Account,
	category *entity.Category,
	kind vo.TransactionType,
	amount int64,
	description string,
	occurredOn time.Time,
) error {
	if account == nil || category == nil {
		return domainerr.Internal("referencia de conta ou categoria ausente no seed", nil)
	}

	transaction, err := entity.NewTransaction(
		userID, account.ID, category.ID, kind, vo.NewMoney(amount), description, "", occurredOn)
	if err != nil {
		return err
	}
	return repo.Create(ctx, transaction)
}

func seedGoals(ctx context.Context, userID uuid.UUID, repo repository.GoalRepository) error {
	now := time.Now().UTC()

	definitions := []struct {
		name        string
		target      int64
		current     int64
		monthsAhead int
		icon        string
		color       string
	}{
		{"Viagem Europa", 1000000, 543000, 6, "plane", "#7C3AED"},
		{"Reserva de Emergencia", 1500000, 875000, 12, "shield", "#10B981"},
		{"Casa Propria", 10000000, 2500000, 24, "home", "#EC4899"},
	}

	for _, definition := range definitions {
		deadline := entity.NormalizeMonth(now.AddDate(0, definition.monthsAhead, 0)).AddDate(0, 1, -1)

		goal, err := entity.NewGoal(
			userID, definition.name,
			vo.NewMoney(definition.target), vo.NewMoney(definition.current),
			&deadline, "", definition.icon, definition.color)
		if err != nil {
			return err
		}
		if err := repo.Create(ctx, goal); err != nil {
			return err
		}
	}
	return nil
}

func seedBudgets(
	ctx context.Context,
	userID uuid.UUID,
	categories map[string]*entity.Category,
	repo repository.BudgetRepository,
) error {
	month := entity.NormalizeMonth(time.Now().UTC())

	limits := map[string]int64{
		"Alimentacao": 180000,
		"Transporte":  60000,
		"Lazer":       40000,
		"Moradia":     320000,
	}

	for name, limit := range limits {
		category, ok := categories[name]
		if !ok {
			continue
		}

		budget, err := entity.NewBudget(userID, category.ID, month, vo.NewMoney(limit))
		if err != nil {
			return err
		}
		if err := repo.Create(ctx, budget); err != nil {
			return err
		}
	}
	return nil
}
