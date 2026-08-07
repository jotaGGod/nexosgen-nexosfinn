package handler

import (
	"log/slog"
	"net/http"

	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/dto"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/application/usecase/apikey"
	"github.com/jotaGGod/nexosgen-nexosfinn/backend/internal/interfaces/presenter"
)

// APIKeyHandler expoe a aba Configuracoes > Integracoes.
type APIKeyHandler struct {
	create *apikey.CreateUseCase
	list   *apikey.ListUseCase
	revoke *apikey.RevokeUseCase
	logger *slog.Logger
}

// NewAPIKeyHandler monta o handler com seus casos de uso.
func NewAPIKeyHandler(
	create *apikey.CreateUseCase,
	list *apikey.ListUseCase,
	revoke *apikey.RevokeUseCase,
	logger *slog.Logger,
) *APIKeyHandler {
	return &APIKeyHandler{create: create, list: list, revoke: revoke, logger: logger}
}

// Create gera uma chave e devolve o segredo em texto puro.
//
// Esta e a unica resposta da API que contem o segredo; a listagem devolve
// apenas o prefixo.
func (h *APIKeyHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	var input dto.CreateAPIKeyInput
	if !decodeJSON(w, r, &input) {
		return
	}

	output, err := h.create.Execute(r.Context(), userID, input)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.JSON(w, http.StatusCreated, output)
}

// List devolve as chaves do usuario, sem os segredos.
func (h *APIKeyHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	output, err := h.list.Execute(r.Context(), userID)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.Data(w, output)
}

// Revoke invalida uma chave.
func (h *APIKeyHandler) Revoke(w http.ResponseWriter, r *http.Request) {
	userID, err := currentUserID(r)
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	keyID, err := pathUUID(r, "id")
	if err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}

	if err := h.revoke.Execute(r.Context(), userID, keyID); err != nil {
		presenter.Error(r.Context(), w, h.logger, err)
		return
	}
	presenter.NoContent(w)
}
