// Package migrations empacota os arquivos SQL dentro do binário.
//
// Em ambientes gerenciados como a Vercel não existe shell para executar o
// golang-migrate como passo separado do deploy. Carregando os arquivos por
// go:embed, o próprio servidor aplica o schema ao iniciar, e o binário passa
// a ser autossuficiente: onde ele roda, o banco fica na versão correta.
package migrations

import "embed"

// Files contém os arquivos .sql de migração.
//
//go:embed *.sql
var Files embed.FS
