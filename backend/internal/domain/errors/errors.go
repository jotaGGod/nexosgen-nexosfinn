// Package errors define os erros de dominio do nexosgen-financehub.
//
// A camada de dominio nao conhece HTTP: ela classifica a falha por Kind e a
// camada interfaces/presenter traduz esse Kind para o status code adequado.
package errors

import (
	"errors"
	"fmt"
)

// Kind classifica a natureza de um erro de dominio.
type Kind int

const (
	KindInternal Kind = iota
	KindInvalidInput
	KindNotFound
	KindConflict
	KindUnauthorized
	KindForbidden
)

// Error e o erro canonico do dominio.
type Error struct {
	Kind    Kind
	Code    string            // identificador estavel consumido pelo cliente, ex.: "email_already_used"
	Message string            // mensagem legivel, em pt-BR
	Fields  map[string]string // erros por campo, usados para destacar inputs no formulario
	Err     error             // causa subjacente, opcional
}

// WithFields anexa erros por campo ao erro de dominio.
func (e *Error) WithFields(fields map[string]string) *Error {
	e.Fields = fields
	return e
}

func (e *Error) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func (e *Error) Unwrap() error { return e.Err }

func newError(kind Kind, code, message string) *Error {
	return &Error{Kind: kind, Code: code, Message: message}
}

// InvalidInput indica dado de entrada que viola uma regra de dominio.
func InvalidInput(code, message string) *Error {
	return newError(KindInvalidInput, code, message)
}

// NotFound indica recurso inexistente ou fora do escopo do usuario autenticado.
func NotFound(code, message string) *Error {
	return newError(KindNotFound, code, message)
}

// Conflict indica violacao de unicidade ou de estado.
func Conflict(code, message string) *Error {
	return newError(KindConflict, code, message)
}

// Unauthorized indica ausencia ou invalidade de credencial.
func Unauthorized(code, message string) *Error {
	return newError(KindUnauthorized, code, message)
}

// Forbidden indica credencial valida sem permissao suficiente.
func Forbidden(code, message string) *Error {
	return newError(KindForbidden, code, message)
}

// Internal encapsula falhas inesperadas de infraestrutura.
func Internal(message string, cause error) *Error {
	return &Error{Kind: KindInternal, Code: "internal_error", Message: message, Err: cause}
}

// KindOf extrai o Kind de um erro; erros desconhecidos sao tratados como internos.
func KindOf(err error) Kind {
	var domainErr *Error
	if errors.As(err, &domainErr) {
		return domainErr.Kind
	}
	return KindInternal
}

// As converte err em *Error quando possivel.
func As(err error) (*Error, bool) {
	var domainErr *Error
	ok := errors.As(err, &domainErr)
	return domainErr, ok
}

// Is reporta se err carrega o Kind informado.
func Is(err error, kind Kind) bool { return KindOf(err) == kind }
