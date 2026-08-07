package postgres

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	// Importado apenas para registrar o driver "pgx5" no golang-migrate.
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/migrations"
)

// migrationDriver e o nome sob o qual o driver do pgx v5 se registra no
// golang-migrate. A biblioteca nao exporta essa constante.
const migrationDriver = "pgx5"

// A primeira execucao das migrations na Vercel foi interrompida enquanto a
// versao 6 estava em andamento: o processo ainda nao havia aberto PORT e a
// plataforma encerrou o startup. Essa migration e idempotente (CREATE TABLE e
// CREATE INDEX usam IF NOT EXISTS), portanto pode ser reaplicada com seguranca.
const recoverableDirtyVersion uint = 6

const undefinedTableCode = "42P01"

// MigrateIfNeeded consulta a tabela de versao usando o pool ja aquecido e so
// inicializa o golang-migrate quando existe trabalho real. Em funcoes
// gerenciadas, abrir uma segunda conexao e tomar o advisory lock em todo cold
// start adicionava segundos mesmo com o schema atualizado.
func MigrateIfNeeded(ctx context.Context, pool *pgxpool.Pool, databaseURL string) (bool, error) {
	latest, err := latestEmbeddedVersion()
	if err != nil {
		return false, err
	}

	var (
		current uint
		dirty   bool
	)
	err = pool.QueryRow(ctx, `SELECT version, dirty FROM schema_migrations LIMIT 1`).Scan(&current, &dirty)
	if err != nil {
		var pgErr *pgconn.PgError
		if !errors.Is(err, pgx.ErrNoRows) && !(errors.As(err, &pgErr) && pgErr.Code == undefinedTableCode) {
			return false, fmt.Errorf("falha ao consultar a versao das migrations: %w", err)
		}
		// Banco novo: a tabela de controle ainda nao existe (ou esta vazia).
		return true, Migrate(databaseURL)
	}

	if !dirty && current >= latest {
		return false, nil
	}
	return true, Migrate(databaseURL)
}

func latestEmbeddedVersion() (uint, error) {
	entries, err := migrations.Files.ReadDir(".")
	if err != nil {
		return 0, fmt.Errorf("falha ao listar as migrations embutidas: %w", err)
	}

	var latest uint64
	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() || !strings.HasSuffix(name, ".up.sql") {
			continue
		}

		prefix, _, ok := strings.Cut(name, "_")
		if !ok {
			return 0, fmt.Errorf("nome de migration invalido: %s", name)
		}
		version, parseErr := strconv.ParseUint(prefix, 10, 32)
		if parseErr != nil {
			return 0, fmt.Errorf("versao de migration invalida em %s: %w", name, parseErr)
		}
		if version > latest {
			latest = version
		}
	}

	if latest == 0 {
		return 0, errors.New("nenhuma migration .up.sql foi embutida")
	}
	return uint(latest), nil
}

// Migrate aplica as migrations pendentes.
//
// Roda na inicializacao do servidor porque em plataformas gerenciadas nao ha
// etapa separada de deploy onde executar o migrate. O golang-migrate toma um
// advisory lock no PostgreSQL antes de aplicar qualquer coisa, entao varias
// instancias subindo ao mesmo tempo nao competem: a primeira migra e as
// demais esperam e seguem.
//
// Quando nao ha nada pendente a funcao apenas devolve, o que torna seguro
// chama-la a cada boot.
func Migrate(databaseURL string) error {
	source, err := iofs.New(migrations.Files, ".")
	if err != nil {
		return fmt.Errorf("falha ao ler as migrations embutidas: %w", err)
	}

	migrator, err := migrate.NewWithSourceInstance("iofs", source, migrationURL(databaseURL))
	if err != nil {
		return fmt.Errorf("falha ao preparar o migrador: %w", err)
	}

	// Fecha apenas o source: a conexao de banco pertence ao migrador e e
	// encerrada por ele.
	defer func() {
		_, _ = migrator.Close()
	}()

	if err := migrateUp(migrator); err != nil {
		return fmt.Errorf("falha ao aplicar as migrations: %w", err)
	}

	return nil
}

// migrationRunner contem apenas as operacoes usadas por migrateUp e permite
// testar a politica de recuperacao sem depender de um PostgreSQL real.
type migrationRunner interface {
	Version() (version uint, dirty bool, err error)
	Force(version int) error
	Up() error
}

func migrateUp(migrator migrationRunner) error {
	version, dirty, err := migrator.Version()
	if err != nil && !errors.Is(err, migrate.ErrNilVersion) {
		return fmt.Errorf("falha ao consultar a versao das migrations: %w", err)
	}

	if dirty {
		if version != recoverableDirtyVersion {
			return fmt.Errorf("banco marcado como dirty na versao %d; recuperacao manual necessaria", version)
		}

		// Volta apenas o marcador. O Up abaixo reaplica efetivamente a migration
		// 6 e depois segue para as restantes; nenhuma migration e pulada.
		if err := migrator.Force(int(version) - 1); err != nil {
			return fmt.Errorf("falha ao preparar a reaplicacao da migration %d: %w", version, err)
		}
	}

	if err := migrator.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}

	return nil
}

// migrationURL adapta a string de conexao para o driver do golang-migrate,
// que espera o esquema "pgx5".
func migrationURL(databaseURL string) string {
	for _, prefix := range []string{"postgresql://", "postgres://"} {
		if strings.HasPrefix(databaseURL, prefix) {
			return migrationDriver + "://" + strings.TrimPrefix(databaseURL, prefix)
		}
	}
	return databaseURL
}
