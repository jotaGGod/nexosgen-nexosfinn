// Package postgres implementa os contratos de domain/repository sobre
// PostgreSQL usando pgx.
//
// Todo SQL da aplicacao vive neste pacote. Nenhuma camada acima dele sabe que
// o banco existe.
package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	domainerr "github.com/jacks/finapp/backend/internal/domain/errors"
)

// Codigos de erro do PostgreSQL que o dominio sabe interpretar.
const (
	uniqueViolationCode     = "23505"
	foreignKeyViolationCode = "23503"
)

// Connect abre o pool de conexoes e espera o banco ficar disponivel.
//
// Em Docker Compose o backend sobe junto do Postgres; a tentativa em ciclo
// evita depender de ordem exata de inicializacao.
func Connect(ctx context.Context, databaseURL string, attempts int) (*pgxpool.Pool, error) {
	poolConfig, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("DATABASE_URL invalida: %w", err)
	}

	poolConfig.MaxConns = 10
	poolConfig.MaxConnLifetime = time.Hour
	poolConfig.HealthCheckPeriod = time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("falha ao criar o pool de conexoes: %w", err)
	}

	var lastErr error
	for attempt := 1; attempt <= attempts; attempt++ {
		pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
		lastErr = pool.Ping(pingCtx)
		cancel()

		if lastErr == nil {
			return pool, nil
		}

		select {
		case <-ctx.Done():
			pool.Close()
			return nil, ctx.Err()
		case <-time.After(time.Duration(attempt) * time.Second):
		}
	}

	pool.Close()
	return nil, fmt.Errorf("banco de dados indisponivel apos %d tentativas: %w", attempts, lastErr)
}

// translateError converte erros do driver em erros de dominio, para que as
// camadas acima nunca precisem inspecionar codigos do PostgreSQL.
func translateError(err error, notFoundCode, notFoundMessage string) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, pgx.ErrNoRows) {
		return domainerr.NotFound(notFoundCode, notFoundMessage)
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case uniqueViolationCode:
			return domainerr.Conflict("already_exists", "ja existe um registro com estes dados")
		case foreignKeyViolationCode:
			return domainerr.Conflict("in_use", "este registro esta vinculado a outros dados")
		}
	}

	return domainerr.Internal("falha ao acessar o banco de dados", err)
}
