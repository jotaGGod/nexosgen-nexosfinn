// Package handler traduz requisicoes HTTP em chamadas de caso de uso.
//
// Handlers nao contem regra de negocio: eles leem a entrada, delegam e
// entregam a resposta ao presenter.
package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	domainerr "github.com/jacks/finapp/backend/internal/domain/errors"
	"github.com/jacks/finapp/backend/internal/interfaces/http/middleware"
	"github.com/jacks/finapp/backend/internal/interfaces/presenter"
)

// maxBodyBytes limita o corpo aceito, evitando que um payload gigante consuma
// memoria do servidor.
const maxBodyBytes = 1 << 20 // 1 MB

// decodeJSON le o corpo da requisicao. Devolve false quando ja respondeu erro.
func decodeJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(target); err != nil {
		presenter.BadRequest(w, "invalid_body", "corpo da requisicao invalido: "+err.Error())
		return false
	}
	return true
}

// currentUserID recupera o usuario autenticado injetado pelo middleware.
func currentUserID(r *http.Request) (uuid.UUID, error) {
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		return uuid.Nil, domainerr.Unauthorized("unauthenticated", "autenticacao necessaria")
	}
	return userID, nil
}

// pathUUID le um identificador da rota.
func pathUUID(r *http.Request, param string) (uuid.UUID, error) {
	raw := chi.URLParam(r, param)

	parsed, err := uuid.Parse(raw)
	if err != nil {
		return uuid.Nil, domainerr.InvalidInput("invalid_id", "identificador invalido")
	}
	return parsed, nil
}

// queryInt le um inteiro da query string.
func queryInt(r *http.Request, key string, fallback int) int {
	raw := strings.TrimSpace(r.URL.Query().Get(key))
	if raw == "" {
		return fallback
	}

	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return value
}

// queryBool le um booleano da query string.
func queryBool(r *http.Request, key string) bool {
	value, err := strconv.ParseBool(strings.TrimSpace(r.URL.Query().Get(key)))
	return err == nil && value
}

// queryList aceita tanto repeticao do parametro (?id=a&id=b) quanto lista
// separada por virgula (?id=a,b), que e o formato mais comum vindo de um
// componente de filtro no frontend.
func queryList(r *http.Request, key string) []string {
	raw := r.URL.Query()[key]

	values := make([]string, 0, len(raw))
	for _, item := range raw {
		for _, part := range strings.Split(item, ",") {
			if trimmed := strings.TrimSpace(part); trimmed != "" {
				values = append(values, trimmed)
			}
		}
	}
	return values
}
