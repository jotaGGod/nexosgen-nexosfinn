// Command api sobe o servidor HTTP do FinApp.
//
// Este arquivo e o unico lugar onde as camadas se encontram: aqui a
// infraestrutura concreta e injetada nos casos de uso, e os casos de uso nos
// handlers. Nao ha container de DI nem reflexao — o grafo de dependencias e
// explicito e verificado pelo compilador.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jacks/finapp/backend/internal/application/usecase/account"
	"github.com/jacks/finapp/backend/internal/application/usecase/apikey"
	"github.com/jacks/finapp/backend/internal/application/usecase/auth"
	"github.com/jacks/finapp/backend/internal/application/usecase/budget"
	"github.com/jacks/finapp/backend/internal/application/usecase/category"
	"github.com/jacks/finapp/backend/internal/application/usecase/dashboard"
	"github.com/jacks/finapp/backend/internal/application/usecase/goal"
	"github.com/jacks/finapp/backend/internal/application/usecase/report"
	"github.com/jacks/finapp/backend/internal/application/usecase/transaction"
	"github.com/jacks/finapp/backend/internal/config"
	infraapikey "github.com/jacks/finapp/backend/internal/infrastructure/apikey"
	infraauth "github.com/jacks/finapp/backend/internal/infrastructure/auth"
	"github.com/jacks/finapp/backend/internal/infrastructure/persistence/postgres"
	"github.com/jacks/finapp/backend/internal/interfaces/http/handler"
	"github.com/jacks/finapp/backend/internal/interfaces/http/router"
	"github.com/jacks/finapp/backend/pkg/logger"
)

func main() {
	if err := run(); err != nil {
		slog.Error("falha ao iniciar o servidor", slog.Any("error", err))
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	log := logger.New(cfg.LogLevel, cfg.Env)
	slog.SetDefault(log)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// Abre a porta antes de conectar ao banco e aplicar migrations. Plataformas
	// gerenciadas esperam que o processo passe a escutar rapidamente e podem
	// encerra-lo durante o startup caso o banco remoto demore. As conexoes ficam
	// na fila do sistema operacional ate o handler estar pronto logo abaixo.
	listener, err := net.Listen("tcp", ":"+cfg.HTTPPort)
	if err != nil {
		return err
	}
	defer listener.Close()

	log.Info("porta HTTP aberta", slog.String("port", cfg.HTTPPort), slog.String("env", cfg.Env))

	pool, err := postgres.Connect(ctx, cfg.DatabaseURL, 10)
	if err != nil {
		return err
	}
	defer pool.Close()

	log.Info("conectado ao banco de dados")

	// O schema e aplicado no boot porque plataformas gerenciadas nao oferecem
	// uma etapa de deploy onde rodar o migrate. Falhar aqui e proposital: e
	// melhor o servico nao subir do que atender requisicoes contra um banco
	// desatualizado.
	if err := postgres.Migrate(cfg.DatabaseURL); err != nil {
		return err
	}

	log.Info("migrations aplicadas")

	// --- Infraestrutura ---
	users := postgres.NewUserRepository(pool)
	accounts := postgres.NewAccountRepository(pool)
	categories := postgres.NewCategoryRepository(pool)
	transactions := postgres.NewTransactionRepository(pool)
	analytics := postgres.NewAnalyticsRepository(pool)
	goals := postgres.NewGoalRepository(pool)
	budgets := postgres.NewBudgetRepository(pool)
	apiKeys := postgres.NewAPIKeyRepository(pool)
	refreshTokens := postgres.NewRefreshTokenRepository(pool)

	hasher := infraauth.NewBcryptHasher(0)
	tokens := infraauth.NewJWTProvider(cfg.JWTSecret, cfg.AccessTokenTTL, cfg.RefreshTokenTTL)
	keyGenerator := infraapikey.NewGenerator(cfg.APIKeyPrefix)

	// --- Casos de uso ---
	registerUC := auth.NewRegisterUseCase(users, categories, accounts, refreshTokens, hasher, tokens, log)
	loginUC := auth.NewLoginUseCase(users, refreshTokens, hasher, tokens)
	refreshUC := auth.NewRefreshUseCase(users, refreshTokens, tokens)
	logoutUC := auth.NewLogoutUseCase(refreshTokens, tokens)
	profileUC := auth.NewGetProfileUseCase(users)
	updateProfileUC := auth.NewUpdateProfileUseCase(users)
	changePasswordUC := auth.NewChangePasswordUseCase(users, refreshTokens, hasher)

	createTransactionUC := transaction.NewCreateUseCase(transactions, categories, accounts)
	updateTransactionUC := transaction.NewUpdateUseCase(transactions, categories, accounts)
	deleteTransactionUC := transaction.NewDeleteUseCase(transactions)
	getTransactionUC := transaction.NewGetUseCase(transactions, categories, accounts)
	listTransactionsUC := transaction.NewListUseCase(transactions, categories, accounts)

	createCategoryUC := category.NewCreateUseCase(categories)
	updateCategoryUC := category.NewUpdateUseCase(categories)
	deleteCategoryUC := category.NewDeleteUseCase(categories)
	listCategoriesUC := category.NewListUseCase(categories)

	createAccountUC := account.NewCreateUseCase(accounts)
	updateAccountUC := account.NewUpdateUseCase(accounts, analytics)
	deleteAccountUC := account.NewDeleteUseCase(accounts)
	listAccountsUC := account.NewListUseCase(accounts, analytics)

	createGoalUC := goal.NewCreateUseCase(goals)
	updateGoalUC := goal.NewUpdateUseCase(goals)
	deleteGoalUC := goal.NewDeleteUseCase(goals)
	listGoalsUC := goal.NewListUseCase(goals)
	contributeGoalUC := goal.NewContributeUseCase(goals)

	upsertBudgetUC := budget.NewUpsertUseCase(budgets, categories, analytics)
	listBudgetsUC := budget.NewListUseCase(budgets, categories, analytics)
	deleteBudgetUC := budget.NewDeleteUseCase(budgets)

	summaryUC := dashboard.NewGetSummaryUseCase(accounts, analytics)
	cashflowUC := dashboard.NewGetCashflowUseCase(analytics)
	byCategoryUC := dashboard.NewGetByCategoryUseCase(categories, analytics)
	dashboardUC := dashboard.NewGetDashboardUseCase(
		summaryUC, cashflowUC, byCategoryUC, transactions, categories, accounts, goals)

	overviewUC := report.NewGetOverviewUseCase(analytics)
	trendsUC := report.NewGetTrendsUseCase(cashflowUC)
	insightsUC := report.NewGetInsightsUseCase(categories, analytics)
	reportUC := report.NewGetReportUseCase(overviewUC, trendsUC, insightsUC, cashflowUC, byCategoryUC)

	createAPIKeyUC := apikey.NewCreateUseCase(apiKeys, keyGenerator)
	listAPIKeysUC := apikey.NewListUseCase(apiKeys)
	revokeAPIKeyUC := apikey.NewRevokeUseCase(apiKeys)
	authenticateAPIKeyUC := apikey.NewAuthenticateUseCase(apiKeys, keyGenerator, log)

	// --- Interface HTTP ---
	httpHandler := router.New(router.Dependencies{
		Config:              cfg,
		Logger:              log,
		TokenVerifier:       tokens,
		APIKeyAuthenticator: authenticateAPIKeyUC,
		OpenAPIPath:         getEnvOrDefault("OPENAPI_PATH", "docs/openapi.yaml"),

		Health: handler.NewHealthHandler(pool),
		Auth: handler.NewAuthHandler(
			registerUC, loginUC, refreshUC, logoutUC, profileUC, updateProfileUC, changePasswordUC, log),
		Transaction: handler.NewTransactionHandler(
			createTransactionUC, updateTransactionUC, deleteTransactionUC, getTransactionUC, listTransactionsUC, log),
		Category: handler.NewCategoryHandler(
			createCategoryUC, updateCategoryUC, deleteCategoryUC, listCategoriesUC, log),
		Account: handler.NewAccountHandler(
			createAccountUC, updateAccountUC, deleteAccountUC, listAccountsUC, log),
		Goal: handler.NewGoalHandler(
			createGoalUC, updateGoalUC, deleteGoalUC, listGoalsUC, contributeGoalUC, log),
		Budget:    handler.NewBudgetHandler(upsertBudgetUC, listBudgetsUC, deleteBudgetUC, log),
		Dashboard: handler.NewDashboardHandler(dashboardUC, log),
		Report:    handler.NewReportHandler(reportUC, log),
		APIKey:    handler.NewAPIKeyHandler(createAPIKeyUC, listAPIKeysUC, revokeAPIKeyUC, log),
		External: handler.NewExternalHandler(
			createTransactionUC, updateTransactionUC, listTransactionsUC,
			listCategoriesUC, listAccountsUC, summaryUC, log),
	})

	server := &http.Server{
		Addr:              ":" + cfg.HTTPPort,
		Handler:           httpHandler,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       time.Minute,
	}

	serverErrors := make(chan error, 1)
	go func() {
		log.Info("servidor HTTP no ar", slog.String("port", cfg.HTTPPort), slog.String("env", cfg.Env))
		if err := server.Serve(listener); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrors <- err
		}
	}()

	select {
	case err := <-serverErrors:
		return err
	case <-ctx.Done():
		log.Info("encerrando o servidor")
	}

	// Encerramento gracioso: requisicoes em andamento tem tempo de terminar
	// antes de o processo sair.
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	return server.Shutdown(shutdownCtx)
}

func getEnvOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
