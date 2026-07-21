package postgres

import "github.com/jackc/pgx/v5"

// errNoRows permite reutilizar translateError quando um UPDATE ou DELETE nao
// afeta nenhuma linha — situacao que o driver nao sinaliza como erro, mas que
// para o dominio significa "nao encontrado".
var errNoRows = pgx.ErrNoRows
