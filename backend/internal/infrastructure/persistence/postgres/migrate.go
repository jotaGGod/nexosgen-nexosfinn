package postgres

import (
	"errors"
	"fmt"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	// Importado apenas para registrar o driver "pgx5" no golang-migrate.
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/jacks/finapp/backend/migrations"
)

// migrationDriver e o nome sob o qual o driver do pgx v5 se registra no
// golang-migrate. A biblioteca nao exporta essa constante.
const migrationDriver = "pgx5"

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

	if err := migrator.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("falha ao aplicar as migrations: %w", err)
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
