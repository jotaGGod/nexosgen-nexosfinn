package presenter

import (
	"context"
	"log/slog"
	"net/http"

	domainerr "github.com/jotaGGod/nexosgen-financehub/backend/internal/domain/errors"
)

// ErrorBody e o corpo padrao de qualquer resposta de erro da API.
type ErrorBody struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

// ErrorResponse embrulha o erro, mantendo o formato estavel para o cliente.
type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}

// statusByKind traduz a classificacao do dominio para o protocolo HTTP.
//
// Esta tabela e a unica ponte entre os dois vocabularios: os casos de uso
// classificam a falha, e o HTTP e detalhe de entrega.
var statusByKind = map[domainerr.Kind]int{
	domainerr.KindInvalidInput: http.StatusUnprocessableEntity,
	domainerr.KindNotFound:     http.StatusNotFound,
	domainerr.KindConflict:     http.StatusConflict,
	domainerr.KindUnauthorized: http.StatusUnauthorized,
	domainerr.KindForbidden:    http.StatusForbidden,
	domainerr.KindInternal:     http.StatusInternalServerError,
}

// Error responde ao cliente traduzindo o erro de dominio.
//
// Falhas internas nao vazam a causa: o detalhe vai para o log, o cliente
// recebe uma mensagem generica.
func Error(ctx context.Context, w http.ResponseWriter, logger *slog.Logger, err error) {
	domainError, ok := domainerr.As(err)
	if !ok {
		domainError = domainerr.Internal("erro inesperado", err)
	}

	status, mapped := statusByKind[domainError.Kind]
	if !mapped {
		status = http.StatusInternalServerError
	}

	if status >= http.StatusInternalServerError {
		logger.ErrorContext(ctx, "falha ao processar a requisicao",
			slog.String("code", domainError.Code), slog.Any("error", err))

		JSON(w, status, ErrorResponse{Error: ErrorBody{
			Code:    "internal_error",
			Message: "erro interno do servidor",
		}})
		return
	}

	JSON(w, status, ErrorResponse{Error: ErrorBody{
		Code:    domainError.Code,
		Message: domainError.Message,
		Fields:  domainError.Fields,
	}})
}

// BadRequest responde 400 para payloads que sequer puderam ser lidos.
func BadRequest(w http.ResponseWriter, code, message string) {
	JSON(w, http.StatusBadRequest, ErrorResponse{Error: ErrorBody{Code: code, Message: message}})
}
